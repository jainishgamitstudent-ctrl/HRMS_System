"use client";

import type SwalType from "sweetalert2";

let SwalModule: typeof SwalType | null = null;

async function getSwal(): Promise<typeof SwalType> {
  if (!SwalModule) {
    SwalModule = (await import("sweetalert2")).default;
  }
  return SwalModule;
}

const baseConfig = {
  confirmButtonColor: "#164cb2",
  cancelButtonColor: "#64748b",
  buttonsStyling: false,
  customClass: {
    popup: "rounded-xl shadow-2xl border border-border bg-card text-card-foreground",
    confirmButton: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90",
    cancelButton: "inline-flex items-center justify-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted",
    title: "text-lg font-semibold text-foreground",
    htmlContainer: "text-sm text-muted-foreground",
    icon: "mx-auto mb-2",
  },
  backdrop: "rgba(15, 23, 42, 0.4)",
  heightAuto: false,
};

export async function showSuccess(title: string, text?: string) {
  const Swal = await getSwal();
  return Swal.fire({
    ...baseConfig,
    icon: "success",
    title,
    text: text || undefined,
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false,
    showCancelButton: false,
  });
}

export async function showError(title: string, text?: string) {
  const Swal = await getSwal();
  return Swal.fire({
    ...baseConfig,
    icon: "error",
    title,
    text: text || undefined,
    confirmButtonText: "Dismiss",
  });
}

export async function showWarning(title: string, text?: string) {
  const Swal = await getSwal();
  return Swal.fire({
    ...baseConfig,
    icon: "warning",
    title,
    text: text || undefined,
    confirmButtonText: "OK",
  });
}

export async function showInfo(title: string, text?: string) {
  const Swal = await getSwal();
  return Swal.fire({
    ...baseConfig,
    icon: "info",
    title,
    text: text || undefined,
    timer: 2500,
    timerProgressBar: true,
    showConfirmButton: false,
    showCancelButton: false,
  });
}

export async function showConfirm(
  title: string,
  text: string,
  confirmText = "Confirm",
  cancelText = "Cancel"
) {
  const Swal = await getSwal();
  return Swal.fire({
    ...baseConfig,
    icon: "question",
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    reverseButtons: true,
  });
}

export async function showDeleteConfirm(
  itemName: string,
  confirmText = "Delete",
  cancelText = "Cancel"
) {
  const Swal = await getSwal();
  return Swal.fire({
    ...baseConfig,
    icon: "warning",
    title: `Delete ${itemName}?`,
    text: `This action cannot be undone. ${itemName} will be permanently removed.`,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: "#ef4444",
    customClass: {
      ...baseConfig.customClass,
      confirmButton: "inline-flex items-center justify-center rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:opacity-90",
    },
    reverseButtons: true,
  });
}
