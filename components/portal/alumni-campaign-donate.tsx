"use client"
import useSWR from "swr"
import type React from "react"

import { useMemo, useState } from "react"

const withToken = (init: RequestInit = {}) => ({
  ...init,
  headers: {
    ...(init.headers || {}),
    "content-type": "application/json",
    "x-session-token": localStorage.getItem("session_token") || "",
  },
})
const jsonFetcher = (url: string) =>
  fetch(url, { headers: { "x-session-token": localStorage.getItem("session_token") || "" } }).then((r) => r.json())

export function AlumniCampaignDonate() {
  const { data: campaignsData, mutate: mutateCampaigns } = useSWR("/api/campaigns", jsonFetcher, {
    refreshInterval: 5000,
  })

  const { data: topDonorsData } = useSWR("/api/donations/top-donors", jsonFetcher, {
    refreshInterval: 30000,
  })

  const campaigns = Array.isArray(campaignsData) ? campaignsData : campaignsData?.items || []
  const topDonors = Array.isArray(topDonorsData) ? topDonorsData : topDonorsData?.items || []

  const [campaignId, setCampaignId] = useState<string>("")
  const [amount, setAmount] = useState<number>(50)
  const [message, setMessage] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState("UPI")
  const [transactionRef, setTransactionRef] = useState("")
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const selected = useMemo(() => campaigns.find((c: any) => c.id === campaignId), [campaignId, campaigns])

  const isCampaignActive = useMemo(() => {
    if (!selected) return false
    const now = new Date()
    const endDate = new Date(selected.endDate || selected.end_date)
    const status = selected.status
    return status === "active" && now <= endDate
  }, [selected])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) {
      setReceiptFile(null)
      return
    }
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File too large. Maximum size is 5MB.")
      return
    }
    setReceiptFile(file)
  }

  function generateTransactionRef() {
    return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  }

  async function submitDonationRequest() {
    if (!campaignId) {
      alert("Please select a campaign.")
      return
    }
    if (!amount || amount <= 0) {
      alert("Please enter a valid amount.")
      return
    }

    setSubmitting(true)
    console.log("[v0] Submitting donation request for campaign:", campaignId, "amount:", amount)
    console.log("[v0] Token being sent:", localStorage.getItem("session_token")?.substring(0, 20))
    try {
      const txnRef = transactionRef || generateTransactionRef()
      console.log("[v0] Transaction ref:", txnRef)

      const formData = new FormData()
      formData.append("amount", amount.toString())
      formData.append("message", message)
      formData.append("transactionRef", txnRef)
      formData.append("isAnonymous", isAnonymous.toString())
      formData.append("paymentMethod", paymentMethod)
      if (receiptFile) {
        formData.append("receipt", receiptFile)
      }

      const response = await fetch(
        `/api/campaigns/${campaignId}/donation-requests`,
        {
          method: "POST",
          headers: {
            "x-session-token": localStorage.getItem("session_token") || "",
          },
          body: formData,
        }
      )

      console.log("[v0] Response status:", response.status)
      const result = await response.json()
      console.log("[v0] Response result:", result)

      if (response.ok) {
        setShowPaymentModal(true)
        setShowSuccess(true)
      } else {
        console.error("[v0] Donation request failed:", result)
        alert(result.error || "Failed to submit donation request. Check console for details.")
      }
    } catch (error) {
      console.error("[v0] Submit donation error:", error)
      alert("Failed to submit donation request. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  async function confirmPayment() {
    await mutateCampaigns()
    setShowPaymentModal(false)
    resetForm()
    alert("Your payment request has been submitted. You'll be notified once the admin verifies your donation.")
  }

  function resetForm() {
    setAmount(50)
    setMessage("")
    setTransactionRef("")
    setReceiptFile(null)
    setIsAnonymous(false)
    setPaymentMethod("UPI")
    setShowSuccess(false)
  }

  return (
    <div className="grid gap-6">
      {/* Top Donors Section */}
      {topDonors.length > 0 && (
        <div className="rounded-lg border bg-card p-4">
          <h3 className="mb-3 text-lg font-semibold flex items-center gap-2">
            <span className="text-2xl">🏆</span> Top Donors
          </h3>
          <div className="grid gap-2 sm:grid-cols-3">
            {topDonors.slice(0, 6).map((donor: any, index: number) => (
              <div key={donor.donor_id || index} className="flex items-center gap-2 rounded-md bg-muted/50 p-2 text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {index + 1}
                </span>
                <span className="font-medium">
                  {donor.is_anonymous ? "Anonymous" : donor.donor_name || "Anonymous"}
                </span>
                <span className="text-muted-foreground ml-auto">${Number(donor.total_amount || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Donation Form */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="mb-2 text-lg font-semibold">Make a Donation</h3>
        <p className="text-sm text-muted-foreground mb-4">
          1. Fill details → 2. Pay via UPI/PhonePe → 3. Submit for verification
        </p>
        
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1">
            <span className="text-sm font-medium">Campaign <span className="text-destructive">*</span></span>
            <select
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="rounded-md border bg-background px-3 py-2"
              aria-label="Select campaign"
            >
              <option value="">Select a campaign</option>
              {campaigns.map((c: any) => {
                const isActive = c.status === "active" && new Date() <= new Date(c.endDate || c.end_date)
                return (
                  <option key={c.id} value={c.id} disabled={!isActive}>
                    {c.title} {!isActive && "(Ended)"}
                  </option>
                )
              })}
            </select>
          </label>
          
          <label className="grid gap-1">
            <span className="text-sm font-medium">Amount (USD) <span className="text-destructive">*</span></span>
            <input
              type="number"
              min={1}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="rounded-md border bg-background px-3 py-2"
              placeholder="50"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Payment Method</span>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="rounded-md border bg-background px-3 py-2"
            >
              <option value="UPI">UPI</option>
              <option value="GPay">Google Pay</option>
              <option value="PhonePe">PhonePe</option>
              <option value="BankTransfer">Bank Transfer</option>
            </select>
          </label>

          <label className="grid gap-1">
            <span className="text-sm font-medium">Transaction Reference</span>
            <input
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="rounded-md border bg-background px-3 py-2"
              placeholder="Auto-generated if empty"
            />
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-medium">Message (optional)</span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="rounded-md border bg-background px-3 py-2 min-h-[60px]"
              placeholder="Your message of support..."
            />
          </label>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <span className="text-sm">Donate anonymously (your name won't be shown)</span>
          </label>

          <label className="grid gap-1 sm:col-span-2">
            <span className="text-sm font-medium">Payment Proof (optional)</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={onUpload}
              className="rounded-md border bg-background px-3 py-2"
            />
            {receiptFile && (
              <span className="text-xs text-green-600">Receipt attached: {receiptFile.name}</span>
            )}
          </label>
        </div>

        <div className="mt-4 flex gap-3">
          <button 
            onClick={submitDonationRequest} 
            disabled={!campaignId || !isCampaignActive || submitting}
            className="h-10 rounded-md bg-primary px-4 text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Submitting..." : "Contribute"}
          </button>
          {!isCampaignActive && campaignId && (
            <span className="text-sm text-destructive self-center">This campaign has ended</span>
          )}
        </div>

        {selected && isCampaignActive && (
          <div className="mt-3 p-3 rounded-md bg-muted">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Goal: ${Number(selected.goalAmount || selected.goal_amount || 0).toLocaleString()}</span>
              <span className="text-muted-foreground">Raised: ${Number(selected.collectedAmount || selected.currentAmount || selected.current_amount || 0).toLocaleString()}</span>
            </div>
            <div className="mt-2 h-2 w-full rounded bg-muted-foreground/20">
              <div 
                className="h-2 rounded bg-primary" 
                style={{ width: `${Math.min(100, (Number(selected.collectedAmount || selected.currentAmount || selected.current_amount || 0) / Number(selected.goalAmount || selected.goal_amount || 1)) * 100)}%` }} 
              />
            </div>
          </div>
        )}
      </div>

      {/* Pending Requests */}
      <div className="rounded-lg border bg-card p-4">
        <h4 className="mb-3 font-medium flex items-center gap-2">
          <span>📋</span> Your Donation Requests
        </h4>
        <AlumniPendingRequests campaignId={campaignId} onSelectCampaign={setCampaignId} />
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="m-4 max-w-md rounded-lg bg-card p-6 shadow-lg">
            <h3 className="mb-4 text-xl font-bold flex items-center gap-2">
              <span>💳</span> Complete Your Payment
            </h3>
            
            <div className="mb-4 rounded-lg bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">Scan QR Code to Pay</p>
              <div className="mx-auto mb-3 h-48 w-48 rounded-lg bg-white p-2">
                <div className="flex h-full items-center justify-center rounded border-2 border-dashed border-gray-300">
                  <div className="text-center">
                    <div className="mb-2 text-4xl">📱</div>
                    <p className="text-xs text-gray-500">UPI QR Code</p>
                    <p className="text-xs text-gray-400">(Configure in settings)</p>
                  </div>
                </div>
              </div>
              <p className="text-sm font-medium">Amount: ${Number(amount).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Use any UPI app: GPay, PhonePe, Paytm</p>
            </div>

            <div className="mb-4 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
              <p><strong>Instructions:</strong></p>
              <ol className="mt-1 list-inside list-decimal">
                <li>Scan QR code with your UPI app</li>
                <li>Pay ${Number(amount).toLocaleString()} to the shown UPI ID</li>
                <li>Copy transaction reference below</li>
                <li>Click "I Have Paid" to submit</li>
              </ol>
            </div>

            <div className="mb-4">
              <label className="text-sm font-medium">Your Transaction Reference</label>
              <input
                value={transactionRef}
                readOnly
                className="mt-1 w-full rounded-md border bg-muted px-3 py-2 font-mono text-sm"
              />
            </div>

            <button
              onClick={confirmPayment}
              className="w-full rounded-md bg-green-600 px-4 py-3 font-medium text-white hover:bg-green-700"
            >
              ✓ I Have Paid - Submit for Verification
            </button>

            <button
              onClick={() => setShowPaymentModal(false)}
              className="mt-2 w-full rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function AlumniPendingRequests({ campaignId, onSelectCampaign }: { campaignId: string; onSelectCampaign: (id: string) => void }) {
  const { data: campaignsData } = useSWR("/api/campaigns", jsonFetcher, {
    refreshInterval: 5000,
  })
  const campaigns = Array.isArray(campaignsData) ? campaignsData : campaignsData?.items || []

  const { data: list, mutate } = useSWR(
    campaignId ? `/api/campaigns/${campaignId}/donation-requests` : null,
    jsonFetcher,
    {
      refreshInterval: 5000,
    },
  )

  const items = Array.isArray(list?.items) ? list.items : []

  return (
    <div className="grid gap-3">
      <label className="grid gap-1">
        <span className="text-sm">Filter by campaign</span>
        <select
          value={campaignId}
          onChange={(e) => onSelectCampaign(e.target.value)}
          className="rounded-md border bg-background px-3 py-2"
        >
          <option value="">All campaigns</option>
          {campaigns.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </select>
      </label>

      <div className="max-h-64 overflow-y-auto">
        {!campaignId && <p className="text-sm text-muted-foreground">Select a campaign to view requests.</p>}
        {campaignId && items.length === 0 && (
          <p className="text-sm text-muted-foreground">No donation requests for this campaign.</p>
        )}
        {items.map((r: any) => (
          <div key={r.id} className="rounded-md border p-3 text-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">${Number(r.amount).toLocaleString()}</span>
                {r.is_anonymous && <span className="ml-2 text-xs text-muted-foreground">(Anonymous)</span>}
              </div>
              <span
                className={`rounded px-2 py-1 text-xs font-medium ${
                  r.status === "pending" 
                    ? "bg-yellow-100 text-yellow-800" 
                    : r.status === "verified" 
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                }`}
              >
                {r.status}
              </span>
            </div>
            {r.message && <p className="mt-1 text-xs text-muted-foreground">{r.message}</p>}
            <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Ref: {r.transaction_reference}</span>
              <span>{new Date(r.created_at).toLocaleDateString()}</span>
            </div>
            {r.admin_notes && (
              <div className="mt-1 rounded bg-muted p-2 text-xs">
                <strong>Admin note:</strong> {r.admin_notes}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
