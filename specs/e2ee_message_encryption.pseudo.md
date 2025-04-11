# specs/e2ee_message_encryption.pseudo.md

## E2EE Message Encryption/Decryption (Client-Side)

Uses established Signal sessions managed by `libsignal-protocol-typescript` and the `SignalProtocolStore`.

### Module: MessageEncryptorDecryptor

**Dependencies:**
*   `SignalProtocolStore` (Interface for secure local storage of keys and sessions)
*   `libsignal` (Actual Signal library functions: SessionCipher)
*   `CurrentUserProvider` (To get current user ID)
*   `KeyManager` (To ensure sessions are established)

**State:**
*   `userId`: Current authenticated user's ID.
*   `signalStore`: Instance of the `SignalProtocolStore`.

---

**Function: `encryptTextMessage(partnerUserId, plaintextMessage)`**

*   **Purpose:** Encrypts a plaintext string for a given recipient using the established Signal session.
*   **Returns:** Object containing `ciphertext` (Base64 string) and `signal_message_type` (1 or 3), or FAILURE.

```pseudocode
FUNCTION encryptTextMessage(partnerUserId, plaintextMessage):
  // TDD: Test successful encryption of a standard text message
  // TDD: Test encryption when session needs to be established first
  // TDD: Test encryption failure if session cannot be established
  // TDD: Test output format (CiphertextMessage type 1 or 3)
  // TDD: Test encryption of empty message
  // TDD: Test encryption of message with special characters/unicode

  LOG "Encrypting message for:", partnerUserId
  signalAddress = CREATE SignalProtocolAddress(partnerUserId, deviceId=1) // Assuming deviceId 1

  // 1. Ensure session exists (KeyManager might handle this implicitly or explicitly)
  // It's crucial establishSession is called before attempting to encrypt if no session exists.
  // This might happen when sending the very first message.
  hasSession = AWAIT KeyManager.establishSession(partnerUserId) // Ensure session is ready
  IF hasSession IS FAILURE THEN
    ERROR "Cannot encrypt message: Failed to establish session with", partnerUserId
    RETURN FAILURE // Or throw error
  ENDIF

  // 2. Create SessionCipher for the recipient
  // The store needs to be populated with session data by establishSession first.
  sessionCipher = CREATE SessionCipher(this.signalStore, signalAddress)

  // 3. Convert plaintext string to ArrayBuffer (UTF-8 encoded)
  plaintextBuffer = TEXT_ENCODER.encode(plaintextMessage) // Assume TEXT_ENCODER exists

  // 4. Encrypt using the session cipher
  TRY
    // libsignal encrypts the buffer. The result is a CiphertextMessage object
    // containing the ciphertext and metadata (type: 1 for PreKeyWhisperMessage, 3 for WhisperMessage)
    encryptedMessageObject = AWAIT sessionCipher.encrypt(plaintextBuffer)
    LOG "Encryption successful. Type:", encryptedMessageObject.type // 1 or 3

    // 5. Serialize the CiphertextMessage for transmission
    // The library usually provides a serialization method (e.g., .serialize())
    // which returns a format (often ArrayBuffer) suitable for sending.
    serializedCiphertext = encryptedMessageObject.serialize() // Returns ArrayBuffer

    // Convert ArrayBuffer to Base64 string for JSON/DB storage
    base64Ciphertext = CONVERT_TO_BASE64(serializedCiphertext) // Assume CONVERT_TO_BASE64 exists

    RETURN {
      ciphertext: base64Ciphertext, // The encrypted payload + metadata, ready to send
      signal_message_type: encryptedMessageObject.type // Store 1 or 3 in DB
    }
  CATCH error
    ERROR "Encryption failed:", error
    // TDD: Test specific libsignal encryption errors
    RETURN FAILURE // Or throw error
  ENDTRY

ENDFUNCTION
```

---

**Function: `decryptMessage(senderUserId, incomingCiphertextMessage)`**

*   **Purpose:** Decrypts an incoming CiphertextMessage (received from Supabase/Realtime) using the established Signal session.
*   **Input:** `incomingCiphertextMessage` should be an object containing `ciphertext` (Base64 string) and `signal_message_type` (1 or 3).
*   **Returns:** Plaintext string, or FAILURE.

```pseudocode
FUNCTION decryptMessage(senderUserId, incomingCiphertextMessage):
  // TDD: Test successful decryption of PreKeyWhisperMessage (type 1)
  // TDD: Test successful decryption of WhisperMessage (type 3)
  // TDD: Test decryption failure for malformed ciphertext (bad Base64, wrong structure)
  // TDD: Test decryption failure if session doesn't exist for sender
  // TDD: Test decryption failure due to key mismatches (e.g., old session, MAC failure)
  // TDD: Test decryption of empty original message
  // TDD: Test decryption of message with special characters/unicode

  LOG "Decrypting message from:", senderUserId, "Type:", incomingCiphertextMessage.signal_message_type
  signalAddress = CREATE SignalProtocolAddress(senderUserId, deviceId=1) // Assuming deviceId 1

  // 1. Create SessionCipher for the sender
  // This requires the session state to be already loaded in the signalStore.
  // If this is the first message received (PreKeyWhisperMessage), libsignal handles session creation during decryption.
  sessionCipher = CREATE SessionCipher(this.signalStore, signalAddress)

  // 2. Deserialize the incoming ciphertext
  TRY
    // Convert Base64 string back to ArrayBuffer/Uint8Array first
    serializedCiphertext = CONVERT_FROM_BASE64(incomingCiphertextMessage.ciphertext) // Assume CONVERT_FROM_BASE64 exists
  CATCH base64Error
    ERROR "Invalid Base64 ciphertext received:", base64Error
    RETURN FAILURE
  ENDTRY

  // 3. Determine decryption method based on message type and call libsignal
  TRY
    decryptedBuffer = NULL
    IF incomingCiphertextMessage.signal_message_type == 1 THEN // PreKeyWhisperMessage
      LOG "Decrypting as PreKeyWhisperMessage..."
      // libsignal needs the raw serialized bytes (ArrayBuffer) to parse and decrypt.
      // This method will also establish the session if it's the first message.
      decryptedBuffer = AWAIT sessionCipher.decryptPreKeyWhisperMessage(serializedCiphertext)
    ELSE IF incomingCiphertextMessage.signal_message_type == 3 THEN // WhisperMessage
      LOG "Decrypting as WhisperMessage..."
      // This method uses the existing session state.
      decryptedBuffer = AWAIT sessionCipher.decryptWhisperMessage(serializedCiphertext)
    ELSE
      ERROR "Unknown Signal message type:", incomingCiphertextMessage.signal_message_type
      RETURN FAILURE // Or throw error
    ENDIF

    // 4. Convert decrypted ArrayBuffer back to plaintext string (UTF-8)
    IF decryptedBuffer IS NOT NULL THEN
      plaintextMessage = TEXT_DECODER.decode(decryptedBuffer) // Assume TEXT_DECODER exists
      LOG "Decryption successful."
      RETURN plaintextMessage
    ELSE
      // This path might occur if decrypt methods return null on certain failures instead of throwing.
      ERROR "Decryption returned null buffer, indicating failure."
      RETURN FAILURE
    ENDIF

  CATCH error
    ERROR "Decryption failed:", error
    // TDD: Test specific libsignal decryption errors (DuplicateMessageError, InvalidMessageError, InvalidKeyIdError, NoSessionError, etc.)
    // Consider potential session synchronization issues (e.g., lost messages, out-of-order delivery).
    // libsignal attempts to handle some level of synchronization.
    // If decryption fails persistently (e.g., NoSessionError after expected setup), might indicate deeper issues.
    RETURN FAILURE // Or throw error
  ENDTRY

ENDFUNCTION