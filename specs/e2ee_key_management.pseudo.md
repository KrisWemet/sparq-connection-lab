# specs/e2ee_key_management.pseudo.md

## E2EE Key Management (Client-Side)

Uses concepts from `libsignal-protocol-typescript`. Assumes a `SignalProtocolStore` implementation exists for managing keys locally, backed by a `SecureStorageAdapter`.

### Module: KeyManager

**Dependencies:**
*   `SignalProtocolStore` (Interface for secure local storage of keys)
*   `libsignal` (Actual Signal library functions: KeyHelper, SessionBuilder, etc.)
*   `SupabaseClient` (For interacting with Supabase DB `e2ee_keys` table)
*   `SecureStorageAdapter` (Platform-specific secure storage: Keychain, Keystore, IndexedDB+SubtleCrypto wrapper)
*   `CurrentUserProvider` (To get current user ID)

**State:**
*   `userId`: Current authenticated user's ID.
*   `isInitialized`: Boolean flag indicating if keys have been generated and stored/published.
*   `signalStore`: Instance of the `SignalProtocolStore`.

---

**Function: `initializeKeysIfNeeded(userId)`**

*   **Purpose:** Checks if keys exist locally and remotely; generates, stores, and publishes them if not.
*   **Trigger:** Called on user login/app startup after authentication.

```pseudocode
FUNCTION initializeKeysIfNeeded(userId):
  // TDD: Test case for first-time initialization
  // TDD: Test case for already initialized user
  // TDD: Test case for local keys exist but remote keys missing
  // TDD: Test case for error during key generation
  // TDD: Test case for error during secure storage
  // TDD: Test case for error during Supabase publish

  LOG "Initializing E2EE keys for user:", userId
  SET this.userId = userId
  SET this.signalStore = CREATE SignalProtocolStore(userId, SecureStorageAdapter) // Adapter handles platform specifics

  // 1. Check local storage first (fastest check)
  identityKeyPair = AWAIT this.signalStore.getIdentityKeyPair()
  registrationId = AWAIT this.signalStore.getLocalRegistrationId()

  IF identityKeyPair IS NULL OR registrationId IS NULL THEN
    LOG "Local keys not found. Generating new keys."
    CALL generateAndStoreKeys()
    SET isInitialized = false // Force remote check/publish
  ELSE
    LOG "Local keys found."
    // Optionally verify keys are valid/parsable here
    SET isInitialized = true // Assume initialized, but verify remote next
  ENDIF

  // 2. Check if keys are published on Supabase
  remoteKeys = AWAIT fetchKeyBundleFromSupabase(userId) // Check own keys

  IF remoteKeys IS NULL THEN
    LOG "Remote keys not found for user", userId
    IF NOT isInitialized THEN
       ERROR "Local keys should have been generated but weren't. Aborting." // Should not happen if generateAndStoreKeys worked
       RETURN FAILURE
    ENDIF
    LOG "Publishing generated keys to Supabase."
    result = AWAIT publishPublicKeysToSupabase()
    IF result IS FAILURE THEN
      ERROR "Failed to publish keys to Supabase."
      // Consider retry logic or notifying the user
      RETURN FAILURE
    ELSE
      LOG "Keys published successfully."
      SET this.isInitialized = true
      RETURN SUCCESS
    ENDIF
  ELSE
    LOG "Remote keys found. Initialization complete."
    // Optional: Compare local public keys with remote ones for consistency check?
    SET this.isInitialized = true
    RETURN SUCCESS
  ENDIF

ENDFUNCTION
```

---

**Internal Function: `generateAndStoreKeys()`**

*   **Purpose:** Generates all necessary Signal keys and stores them securely.

```pseudocode
FUNCTION generateAndStoreKeys():
  // TDD: Test successful key generation and storage
  // TDD: Test specific key formats/types generated
  LOG "Generating Identity Key Pair..."
  identityKeyPair = AWAIT libsignal.KeyHelper.generateIdentityKeyPair()

  LOG "Generating Registration ID..."
  registrationId = AWAIT libsignal.KeyHelper.generateRegistrationId() // Typically a random integer

  LOG "Generating Signed PreKey..."
  signedPreKeyId = 1 // Choose a suitable ID, e.g., 1 or timestamp-based
  signedPreKey = AWAIT libsignal.KeyHelper.generateSignedPreKey(identityKeyPair, signedPreKeyId)

  LOG "Generating One-Time PreKeys..."
  numberOfPreKeys = 100 // Configurable
  oneTimePreKeys = AWAIT libsignal.KeyHelper.generatePreKeys(start_index=1, count=numberOfPreKeys)

  LOG "Storing keys securely..."
  // Use the SignalProtocolStore interface, which delegates to SecureStorageAdapter
  AWAIT this.signalStore.storeIdentityKeyPair(identityKeyPair)
  AWAIT this.signalStore.storeLocalRegistrationId(registrationId)
  // Store the full SignedPreKeyPair (public + private) locally
  AWAIT this.signalStore.storeSignedPreKey(signedPreKey.keyId, signedPreKey.keyPair)

  FOR EACH preKey IN oneTimePreKeys:
    // Store the full PreKeyPair (public + private) locally
    AWAIT this.signalStore.storePreKey(preKey.keyId, preKey.keyPair)
  ENDFOR

  LOG "Key generation and local storage complete."
  RETURN SUCCESS // Or raise error if any step failed

ENDFUNCTION
```

---

**Internal Function: `publishPublicKeysToSupabase()`**

*   **Purpose:** Gathers public keys from local store and uploads them to the `e2ee_keys` table.

```pseudocode
FUNCTION publishPublicKeysToSupabase():
  // TDD: Test successful key publishing
  // TDD: Test correct data format sent to Supabase
  // TDD: Test handling of Supabase errors (e.g., unique constraint violation, network error)
  LOG "Fetching public keys for publishing..."

  identityKeyPair = AWAIT this.signalStore.getIdentityKeyPair()
  registrationId = AWAIT this.signalStore.getLocalRegistrationId()
  signedPreKeyId = 1 // Must match the ID used in generation
  signedPreKeyPair = AWAIT this.signalStore.loadSignedPreKey(signedPreKeyId)
  // Fetch all one-time prekeys (might need a specific method in the store)
  allPreKeys = AWAIT this.signalStore.loadAllPreKeys() // Hypothetical method returning array of {keyId, keyPair}

  IF identityKeyPair IS NULL OR registrationId IS NULL OR signedPreKeyPair IS NULL THEN
      ERROR "Cannot publish keys, local keys missing."
      RETURN FAILURE
  ENDIF

  // Extract public parts and format for Supabase
  identityKeyPublic = identityKeyPair.pubKey // Assuming ArrayBuffer/Uint8Array
  signedPreKeyPublic = signedPreKeyPair.pubKey // Assuming ArrayBuffer/Uint8Array
  // The signature is part of the SignedPreKey object generated by libsignal
  signedPreKeySignature = signedPreKeyPair.signature // Assuming ArrayBuffer/Uint8Array

  // Format one-time prekeys as JSONB: { keyId: base64PublicKey, ... }
  oneTimePreKeysPublicJson = {}
  FOR EACH preKeyData IN allPreKeys:
      // Convert ArrayBuffer/Uint8Array public key to Base64 string
      base64PubKey = CONVERT_TO_BASE64(preKeyData.keyPair.pubKey)
      oneTimePreKeysPublicJson[preKeyData.keyId] = base64PubKey
  ENDFOR

  // Convert binary keys (ArrayBuffer/Uint8Array) to Base64 strings for JSON compatibility
  // Supabase BYTEA columns can often accept Base64 strings directly via the JS client.
  identityKeyPublicB64 = CONVERT_TO_BASE64(identityKeyPublic)
  signedPreKeyPublicB64 = CONVERT_TO_BASE64(signedPreKeyPublic)
  signedPreKeySignatureB64 = CONVERT_TO_BASE64(signedPreKeySignature)


  keyData = {
    user_id: this.userId,
    identity_key: identityKeyPublicB64, // Send as Base64
    registration_id: registrationId,
    signed_prekey_id: signedPreKeyId,
    signed_prekey_public: signedPreKeyPublicB64, // Send as Base64
    signed_prekey_signature: signedPreKeySignatureB64, // Send as Base64
    one_time_prekeys: oneTimePreKeysPublicJson
  }

  LOG "Upserting keys to Supabase e2ee_keys table for user:", this.userId
  { data, error } = AWAIT SupabaseClient
    .from('e2ee_keys')
    .upsert(keyData, { onConflict: 'user_id' }) // Use upsert to handle potential re-publish/updates
    .select()
    .single()

  IF error THEN
    ERROR "Supabase error publishing keys:", error.message
    RETURN FAILURE
  ELSE
    LOG "Keys published successfully to Supabase:", data
    RETURN SUCCESS
  ENDIF

ENDFUNCTION
```

---

**Function: `fetchKeyBundleFromSupabase(partnerUserId)`**

*   **Purpose:** Retrieves a user's public key bundle required to initiate a Signal session. Includes claiming a one-time prekey.

```pseudocode
FUNCTION fetchKeyBundleFromSupabase(partnerUserId):
  // TDD: Test fetching existing keys successfully
  // TDD: Test fetching non-existent keys (should return null/error)
  // TDD: Test handling of Supabase errors
  // TDD: Test successful prekey claiming via Edge Function
  // TDD: Test failure when user is out of prekeys (via Edge Function response)
  LOG "Fetching key bundle for user:", partnerUserId

  // Step 1: Fetch the main bundle components (excluding one-time keys initially)
  { data, error } = AWAIT SupabaseClient
    .from('e2ee_keys')
    .select(`
      user_id,
      identity_key,
      registration_id,
      signed_prekey_id,
      signed_prekey_public,
      signed_prekey_signature
    `)
    .eq('user_id', partnerUserId)
    .maybeSingle()

  IF error THEN
    ERROR "Supabase error fetching key bundle base:", error.message
    RETURN NULL
  ENDIF

  IF data IS NULL THEN
    LOG "No key bundle base found for user:", partnerUserId
    RETURN NULL
  ENDIF

  LOG "Key bundle base fetched successfully for user:", partnerUserId

  // Step 2: Claim a one-time prekey using an Edge Function for atomicity
  LOG "Claiming one-time prekey for user:", partnerUserId
  { claimedKeyData, claimError } = AWAIT SupabaseClient.functions.invoke('claim_prekey', {
      body: JSON.stringify({ target_user_id: partnerUserId }) // Ensure body is stringified JSON
  })

  // Check for function invocation errors or errors returned by the function itself
  IF claimError THEN
      ERROR "Error invoking claim_prekey function:", claimError.message
      RETURN NULL
  ENDIF
  IF claimedKeyData IS NULL OR claimedKeyData.error THEN
      ERROR "Failed to claim prekey for user:", partnerUserId, claimedKeyData?.error || "No data returned"
      // This could mean the user is out of prekeys
      RETURN NULL // Cannot establish session without a prekey
  ENDIF

  LOG "Prekey claimed successfully:", claimedKeyData

  // Step 3: Process the fetched data and claimed prekey
  TRY
    // Convert Base64 keys back to ArrayBuffer/Uint8Array
    identityKey = CONVERT_FROM_BASE64(data.identity_key)
    signedPreKeyPublic = CONVERT_FROM_BASE64(data.signed_prekey_public)
    signedPreKeySignature = CONVERT_FROM_BASE64(data.signed_prekey_signature)
    claimedPreKeyPublic = CONVERT_FROM_BASE64(claimedKeyData.publicKey)

    // Construct the PreKeyBundle object for libsignal
    preKeyBundle = {
      identityKey: identityKey,
      registrationId: data.registration_id,
      preKey: { // The claimed one-time prekey
        keyId: claimedKeyData.keyId,
        publicKey: claimedPreKeyPublic
      },
      signedPreKey: {
        keyId: data.signed_prekey_id,
        publicKey: signedPreKeyPublic,
        signature: signedPreKeySignature
      }
    }
    RETURN preKeyBundle
  CATCH conversionError
    ERROR "Error converting key data from Base64:", conversionError
    RETURN NULL
  ENDTRY

ENDFUNCTION

// Placeholder for the Edge Function logic (would be in Supabase project)
/*
-- Supabase Edge Function: claim_prekey (Illustrative SQL inside function)
-- Requires appropriate permissions for the function role.
DECLARE
  target_user_id UUID := (request_body->>'target_user_id')::UUID;
  claimed_key_id INT;
  claimed_public_key TEXT; -- Base64 encoded
  prekey_jsonb JSONB;
  updated_prekey_jsonb JSONB;
BEGIN
  -- Select the user's keys and lock the row
  SELECT one_time_prekeys INTO prekey_jsonb
  FROM public.e2ee_keys
  WHERE user_id = target_user_id
  FOR UPDATE;

  IF prekey_jsonb IS NULL OR jsonb_object_keys(prekey_jsonb)::TEXT = '{}' THEN
    -- Return a specific error structure the client can check
    RETURN json_build_object('error', 'No prekeys available');
  END IF;

  -- Select the first available key ID (deterministic but simple)
  -- A random selection might be slightly better but more complex in SQL.
  claimed_key_id := (SELECT key::INT FROM jsonb_object_keys(prekey_jsonb) AS key LIMIT 1);
  claimed_public_key := prekey_jsonb ->> claimed_key_id::TEXT;

  -- Remove the claimed key atomically
  updated_prekey_jsonb := prekey_jsonb - claimed_key_id::TEXT;

  UPDATE public.e2ee_keys
  SET one_time_prekeys = updated_prekey_jsonb
  WHERE user_id = target_user_id;

  -- Return the claimed key successfully
  RETURN json_build_object('keyId', claimed_key_id, 'publicKey', claimed_public_key);

EXCEPTION
  WHEN others THEN
    -- Log the error internally if possible
    RETURN json_build_object('error', 'Internal server error claiming prekey: ' || SQLERRM);
END;
*/
```

---

**Function: `establishSession(partnerUserId)`**

*   **Purpose:** Fetches partner's key bundle and uses `libsignal` to build a session. Stores the session state.
*   **Trigger:** Called when initiating a chat or sending the first message to a partner.

```pseudocode
FUNCTION establishSession(partnerUserId):
  // TDD: Test successful session establishment with valid bundle
  // TDD: Test failure when partner keys are not found
  // TDD: Test failure when prekey claiming fails
  // TDD: Test correct session state is stored
  // TDD: Test idempotency (calling establishSession when session exists)
  LOG "Attempting to establish session with user:", partnerUserId
  // Define the Signal address for the partner (assuming device ID 1)
  signalAddress = CREATE SignalProtocolAddress(partnerUserId, deviceId=1)

  // Check if session already exists locally using the store
  hasSession = AWAIT this.signalStore.containsSession(signalAddress)
  IF hasSession THEN
    LOG "Session already exists locally with:", partnerUserId
    RETURN SUCCESS // Session is ready
  ENDIF

  LOG "Fetching partner key bundle..."
  preKeyBundle = AWAIT fetchKeyBundleFromSupabase(partnerUserId)

  IF preKeyBundle IS NULL THEN
    ERROR "Failed to get pre-key bundle for", partnerUserId, ". Cannot establish session."
    RETURN FAILURE
  ENDIF

  LOG "Processing pre-key bundle to build session..."
  // Create a SessionBuilder linked to our local store and the partner's address
  sessionBuilder = CREATE SessionBuilder(this.signalStore, signalAddress)

  TRY
    // This performs the X3DH key agreement using the fetched bundle
    // libsignal-protocol-typescript handles storing the resulting session state via the provided signalStore
    AWAIT sessionBuilder.processPreKeyBundle(preKeyBundle)
    LOG "Session established successfully with:", partnerUserId
    RETURN SUCCESS
  CATCH error
    ERROR "Error processing pre-key bundle:", error
    // TDD: Test specific libsignal errors (e.g., invalid signature, bad keys)
    RETURN FAILURE
  ENDTRY

ENDFUNCTION
```

---

**Module: SecureStorageAdapter**

*   **Purpose:** Abstract away platform-specific secure storage mechanisms for private keys.
*   **Interface:** Provides methods like `store(key, value)`, `retrieve(key)`, `remove(key)`.
*   **Implementations:**
    *   **iOS:** Use Keychain API.
    *   **Android:** Use Keystore API.
    *   **Web (Browser):** Use IndexedDB combined with `window.crypto.subtle` to encrypt the keys *before* storing them in IndexedDB. The master encryption key for SubtleCrypto itself must be derived securely (e.g., from user password via PBKDF2) or managed carefully. **This remains the weakest link in web E2EE.**

```pseudocode
// Example Interface (details depend on chosen library/approach)
INTERFACE SecureStorageAdapter:
  METHOD constructor(userId) // Scope storage per user
  METHOD store(storageKey: String, value: String | ArrayBuffer): Promise<void>
  METHOD retrieve(storageKey: String): Promise<String | ArrayBuffer | null>
  METHOD remove(storageKey: String): Promise<void>
ENDINTERFACE

// Example Web Implementation Concept using IndexedDB + SubtleCrypto
CLASS WebSecureStorageAdapter IMPLEMENTS SecureStorageAdapter:
  dbName = "signal_keystore"
  storeName = "user_keys"
  db = null // IndexedDB instance
  masterKey = null // CryptoKey for SubtleCrypto (needs secure derivation/storage)

  METHOD constructor(userId):
    this.dbName = `signal_keystore_${userId}`
    // TODO: Initialize IndexedDB connection (this.db) upon first use
    // TODO: Derive or retrieve masterKey securely (e.g., on login, using PBKDF2 on password)
    //       This masterKey should NOT be stored directly in localStorage or IndexedDB.

  METHOD _getDB(): Promise<IDBPDatabase>
    // Handles opening IndexedDB connection, creating object store if needed

  METHOD _getMasterKey(): Promise<CryptoKey>
    // Handles deriving/retrieving the master key (critical security point)
    // TDD: Test master key derivation/retrieval scenarios

  METHOD store(storageKey, value):
    // TDD: Test encryption and storage success/failure
    db = AWAIT this._getDB()
    key = AWAIT this._getMasterKey()
    iv = window.crypto.getRandomValues(new Uint8Array(12)) // Generate random IV for AES-GCM
    // Ensure value is ArrayBuffer
    bufferValue = (typeof value === 'string') ? TEXT_ENCODER.encode(value) : value

    encryptedData = AWAIT window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv: iv },
      key,
      bufferValue
    )
    // Store IV along with ciphertext
    storedObject = { iv: iv, ciphertext: encryptedData }
    tx = db.transaction(this.storeName, 'readwrite')
    AWAIT tx.store.put(storedObject, storageKey)
    AWAIT tx.done

  METHOD retrieve(storageKey):
    // TDD: Test retrieval and decryption success/failure
    // TDD: Test handling of non-existent key
    db = AWAIT this._getDB()
    key = AWAIT this._getMasterKey()
    storedObject = AWAIT db.get(this.storeName, storageKey)
    IF storedObject IS NULL THEN RETURN NULL

    decryptedData = AWAIT window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv: storedObject.iv },
      key,
      storedObject.ciphertext
    )
    // Return as ArrayBuffer, let Signal store handle potential string conversion if needed
    RETURN decryptedData

  METHOD remove(storageKey):
    // TDD: Test removal success/failure
    db = AWAIT this._getDB()
    tx = db.transaction(this.storeName, 'readwrite')
    AWAIT tx.store.delete(storageKey)
    AWAIT tx.done
ENDCLASS