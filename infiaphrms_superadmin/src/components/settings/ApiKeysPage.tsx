"use client";

import { useState } from "react";
import { AdminShell } from "@/components/layout/AdminShell";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { SettingsLayout } from "./SettingsLayout";
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/providers/ToastProvider";
import { mockApiKeys } from "@/lib/mock-data";
import { Key, Plus, Trash2 } from "lucide-react";

export function ApiKeysPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const { addToast } = useToast();

  return (
    <AdminShell>
      <Breadcrumbs items={[{ label: "Settings", href: "/settings" }, { label: "API Keys" }]} />
      <SettingsLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">API Key Management</h1>
            <p className="text-sm text-muted-foreground">Manage platform API access tokens</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Create Key</Button>
        </div>
        <DataTable
          columns={[
            { key: "name", header: "Name", cell: (k) => <div className="flex items-center gap-2"><Key className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{k.name}</span></div>, sortable: true },
            { key: "preview", header: "Key", cell: (k) => <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{k.keyPreview}</code> },
            { key: "scope", header: "Scope", cell: (k) => <Badge variant="secondary">{k.scope}</Badge> },
            { key: "lastUsed", header: "Last Used", cell: (k) => k.lastUsed ? new Date(k.lastUsed).toLocaleDateString() : "Never", sortable: true },
            { key: "expires", header: "Expires", cell: (k) => k.expiresAt ? new Date(k.expiresAt).toLocaleDateString() : "Never", sortable: true },
            { key: "actions", header: "", cell: (k) => <Button variant="ghost" size="sm" onClick={() => addToast({ title: "API key revoked", type: "warning" })}><Trash2 className="h-4 w-4 text-red-500" /></Button>, className: "w-12" },
          ]}
          data={mockApiKeys}
          keyExtractor={(k) => k.id}
          emptyState={<EmptyState title="No API keys" description="Create an API key to get started." action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4 mr-1.5" /> Create Key</Button>} />}
        />
      </div>
      </SettingsLayout>
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create API Key" footer={<><Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button><Button onClick={() => { setCreateOpen(false); addToast({ title: "API key created", type: "success" }); }}>Create</Button></>}>
        <div className="space-y-4">
          <Input label="Key Name" required />
          <Select label="Scope" options={[{ value: "read", label: "Read Only" }, { value: "read_write", label: "Read & Write" }]} required />
          <Input label="Expiry Date" type="date" />
        </div>
      </Modal>
    </AdminShell>
  );
}
