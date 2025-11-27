# Install GPG on macOS

## Option 1: Install Homebrew First (Recommended)

If you don't have Homebrew, install it first:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Then install GPG:

```bash
brew install gnupg
```

---

## Option 2: Install GPG Suite (GUI Option)

Download and install GPG Suite:
1. Go to: https://gpgtools.org/
2. Download GPG Suite
3. Install it
4. Restart Terminal

---

## Option 3: Use MacPorts (if you have it)

```bash
sudo port install gnupg2
```

---

## After Installation

Once GPG is installed, I can finish setting up the signing automatically!

Run this to check if it worked:
```bash
gpg --version
```

Then let me know and I'll complete the setup!

