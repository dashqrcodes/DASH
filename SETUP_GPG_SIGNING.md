# How to Sign Commits with GPG (Keep Public Repo)

## Why Sign Commits?
- ✅ Vercel can verify commits are from you
- ✅ Keeps your public repo secure
- ✅ Prevents malicious commits from deploying
- ✅ Shows "Verified" badge on GitHub commits

---

## Step 1: Check if you have a GPG key

```bash
gpg --list-secret-keys --keyid-format=long
```

**If you see keys listed:** Skip to Step 3  
**If empty:** Continue to Step 2

---

## Step 2: Generate a GPG key

```bash
gpg --full-generate-key
```

**Follow prompts:**
1. **Kind:** Press `1` (RSA and RSA)
2. **Key size:** Press `Enter` (3072 is default)
3. **Expiration:** Press `Enter` (no expiration) or type `1y` for 1 year
4. **Is this correct?** Type `y`
5. **Real name:** Your name (e.g., `David Gastelum`)
6. **Email:** Your GitHub email (e.g., `david@dashqrcodes.com`)
7. **Comment:** (optional, press Enter)
8. **Confirm:** Type `O` (Okay)
9. **Passphrase:** Create a secure passphrase (or press Enter for no passphrase)

---

## Step 3: List your GPG key ID

```bash
gpg --list-secret-keys --keyid-format=long
```

**Look for output like:**
```
sec   rsa3072/ABC123DEF4567890 2024-01-01 [SC]
      ABCDEF1234567890ABCDEF1234567890ABCDEF12
```

**The part after the `/` is your key ID:** `ABC123DEF4567890`

---

## Step 4: Export your public key

Replace `YOUR_KEY_ID` with your actual key ID from Step 3:

```bash
gpg --armor --export YOUR_KEY_ID
```

**Copy the entire output** (starts with `-----BEGIN PGP PUBLIC KEY BLOCK-----`)

---

## Step 5: Add GPG key to GitHub

1. Go to: https://github.com/settings/keys
2. Click "New GPG key"
3. Paste the key you copied in Step 4
4. Click "Add GPG key"

---

## Step 6: Configure Git to use your GPG key

**Replace `YOUR_KEY_ID` with your actual key ID:**

```bash
git config --global user.signingkey YOUR_KEY_ID
git config --global commit.gpgsign true
```

**This makes ALL commits signed by default.**

---

## Step 7: Test it!

```bash
# Make a small change
echo "test" >> test.txt
git add test.txt
git commit -m "Test GPG signing"
git push
```

**Check on GitHub:**
- Go to your commit on GitHub
- You should see a green "Verified" badge ✅

---

## If You See "Failed to sign" Errors

### macOS - Install GPG tools:
```bash
brew install gnupg
```

### Linux:
```bash
sudo apt-get install gnupg
```

### Set GPG program:
```bash
git config --global gpg.program gpg
```

---

## Optional: Sign commits manually (if you disabled auto-sign)

```bash
git commit -S -m "Your commit message"
```

---

## Troubleshooting

### "gpg: signing failed: No secret key"
- Make sure you used the correct key ID
- Check: `gpg --list-secret-keys`

### "gpg: signing failed: Inappropriate ioctl for device"
```bash
export GPG_TTY=$(tty)
```
Add to `~/.zshrc` or `~/.bashrc` to make permanent.

### Commit shows as "Unverified" on GitHub
- Make sure email in GPG key matches GitHub email
- Check: `git config user.email` matches your GPG key email

---

## After Setup Complete

1. ✅ Your commits will be automatically signed
2. ✅ GitHub shows "Verified" badge
3. ✅ Vercel will accept your deployments
4. ✅ Keep GPG verification enabled in Vercel (more secure!)

