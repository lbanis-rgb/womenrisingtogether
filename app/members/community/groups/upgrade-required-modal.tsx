"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface UpgradeRequiredModalProps {
  open: boolean
  onClose: () => void
  context?: "groups" | "events" | "content"
}

export function UpgradeRequiredModal({ open, onClose, context = "groups" }: UpgradeRequiredModalProps) {
  const handleUpgrade = () => {
    window.location.href = "https://actionera.com"
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade Required</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-gray-600">
            {context === "events"
              ? "Your current plan does not allow you to create events."
              : context === "content"
                ? "Your current plan does not allow you to create content."
                : "Your current plan does not allow you to create a group."}
            <br />
            {context === "events"
              ? "Upgrade to a plan that includes event creation."
              : context === "content"
                ? "Upgrade to a plan that includes content creation."
                : "Upgrade to a plan that includes group creation."}
          </p>
          <p className="text-gray-600 mt-4">
            {context === "events"
              ? "You can still view community events and attend them through the event websites."
              : context === "content"
                ? "You can still view and access all educational content in the library."
                : "You can, however, join a group if it is public or request to join if it's request to join."}
          </p>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleUpgrade}>Upgrade Plan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
