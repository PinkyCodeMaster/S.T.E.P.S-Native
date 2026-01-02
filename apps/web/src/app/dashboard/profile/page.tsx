"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type ListAccountsResult = Awaited<ReturnType<typeof authClient.listAccounts>>;
type Account =
  ListAccountsResult extends { data: (infer U)[] | null | undefined }
  ? U
  : { id: string; providerId: string; email?: string | null };

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name ?? "");
      setImage(session.user.image ?? "");
      loadAccounts();
    }
  }, [session]);

  useEffect(() => {
    if (!sessionPending && !session) {
      router.replace("/sign-in");
    }
  }, [sessionPending, session, router]);

  const loadAccounts = async () => {
    const { data, error } = await authClient.listAccounts();
    setAccountsError(error?.message ?? null);
    setAccounts(Array.isArray(data) ? data : []);
  };

  const updateProfile = async () => {
    setSaving(true);
    const { error } = await authClient.updateUser({ name, image });
    if (error) {
      toast.error(error.message ?? "Failed to update profile");
    } else {
      toast.success("Profile updated");
    }
    setSaving(false);
  };

  const updatePassword = async () => {
    setChangingPassword(true);
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });
    if (error) {
      toast.error(error.message ?? "Failed to update password");
    } else {
      toast.success("Password updated");
      setCurrentPassword("");
      setNewPassword("");
    }
    setChangingPassword(false);
  };

  const unlinkAccount = async (providerId: string) => {
    const { error } = await authClient.unlinkAccount({ providerId });
    if (error) {
      toast.error(error.message ?? "Unable to unlink account");
    } else {
      toast.success("Account unlinked");
      loadAccounts();
    }
  };

  const signOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.replace("/sign-in"),
      },
    });
  };

  const deleteAccount = async () => {
    const { error } = await authClient.deleteUser({
      callbackURL: "/goodbye",
    });
    if (error) {
      toast.error(error.message ?? "Failed to delete account");
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">
          Manage your personal details, security, and linked accounts.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your name and avatar.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-14 w-14">
              <AvatarImage src={image || undefined} alt={name || session.user.email} />
              <AvatarFallback>
                {name
                  ? name
                    .split(" ")
                    .map((p) => p[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()
                  : "ST"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-3">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Avatar URL</Label>
                <Input
                  id="image"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Placeholder shown until uploads (e.g. MinIO) are enabled.
                </p>
              </div>
            </div>
          </div>
          <Button onClick={updateProfile} disabled={saving}>
            {saving ? "Saving..." : "Save profile"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email</CardTitle>
          <CardDescription>Sign-in email (read only).</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={session.user.email ?? ""} disabled readOnly />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>Update your password.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current-password">Current password</Label>
            <Input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-password">New password</Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <Button onClick={updatePassword} disabled={changingPassword}>
            {changingPassword ? "Updating..." : "Update password"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Linked accounts</CardTitle>
          <CardDescription>Manage social or external sign-ins.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {accountsError ? (
            <p className="text-sm text-destructive">{accountsError}</p>
          ) : null}
          {accounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No linked accounts yet.
            </p>
          ) : accounts.length === 1 ? (
            accounts.map((acc: Account) => (
              <div
                key={acc.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{acc.providerId}</p>
                  {acc.email ? (
                    <p className="text-xs text-muted-foreground">{acc.email}</p>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            accounts.map((acc: Account) => (
              <div
                key={acc.id}
                className="flex items-center justify-between rounded-md border px-3 py-2"
              >
                <div>
                  <p className="text-sm font-medium">{acc.providerId}</p>
                  {acc.email ? (
                    <p className="text-xs text-muted-foreground">{acc.email}</p>
                  ) : null}
                </div>
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => unlinkAccount(acc.providerId)}
                >
                  Unlink
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Session</CardTitle>
          <CardDescription>Sign out from this device.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="secondary" onClick={signOut}>
            Sign out
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">Danger zone</CardTitle>
          <CardDescription>
            Delete your account and all associated data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Delete account</p>
              <p className="text-xs text-muted-foreground">
                This action is irreversible.
              </p>
            </div>
            <Button variant="destructive" onClick={deleteAccount}>
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
