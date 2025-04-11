# specs/image_handling.pseudo.md

## E2EE Image Handling Flow (Client-Side)

Describes the process for sending and receiving end-to-end encrypted images using Supabase Storage for the encrypted blobs.

### Module: ImageHandler (Conceptual, likely integrated into `Messaging.tsx` and related services)

**Dependencies:**
*   `SupabaseClient` (For Storage upload/download and message insertion)
*   `MessageEncryptorDecryptor` (To encrypt/decrypt image data and metadata - potentially needs methods for binary data)
*   `KeyManager` (To ensure E2EE session is ready)
*   `MessageStore` (To add/update messages)
*   `UI Components` (Image Picker, Progress Indicator, Image Display, Placeholders)
*   `CurrentUserProvider`
*   `Utils` (generateTemporaryUUID, fileToByteArray, compressImageIfNeeded, CONVERT_TO_BASE64, CONVERT_FROM_BASE64)
*   `StatusUpdateManager` (To send Delivered/Read status)
*   `RealtimeManager` (To know the current active conversation)

---

**1. Sending an Image**

*   **Trigger:** User selects an image file via an input element (`<input type="file" accept="image/*">`). This function would be called from `Messaging.tsx`.

```pseudocode
ASYNC FUNCTION handleImageFileSelected(fileObject, conversationId, partnerUserId):
  // TDD: Test successful image selection, encryption, upload, and message sending
  // TDD: Test handling of large image files (consider browser limits, potential chunking needs if > browser memory)
  // TDD: Test handling of image compression option (verify output size/quality)
  // TDD: Test handling of encryption failure for image data
  // TDD: Test handling of encryption failure for metadata
  // TDD: Test handling of Supabase Storage upload failure (permissions, network)
  // TDD: Test handling of Supabase message insert failure
  // TDD: Test optimistic UI update for image message (shows placeholder, progress indicator)

  LOG "Image file selected:", fileObject.name, "for conversation:", conversationId
  currentUserId = CurrentUserProvider.getCurrentUserId()
  // Assume setIsSending is available from the calling component (Messaging.tsx)
  // setIsSending(true)

  // 1. Optimistic UI Update (Placeholder)
  optimisticId = generateTemporaryUUID()
  // Optional: Generate local preview URL for immediate display
  placeholderPreviewUrl = URL.createObjectURL(fileObject)

  optimisticMessage = {
    id: optimisticId, // Temporary ID
    conversation_id: conversationId,
    sender_id: currentUserId,
    recipient_id: partnerUserId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    message_type: 'IMAGE',
    encrypted_content: null, // Metadata not ready yet
    decryptedContent: null, // No plaintext for image message itself
    status: 'Sending',
    isOptimistic: true,
    // Add temporary fields for UI display during upload/processing
    uploadProgress: 0,
    placeholderDataUrl: placeholderPreviewUrl, // Use local preview
    isLoadingMedia: true // Indicate processing/uploading
  }
  MessageStore.addOrUpdateMessage(conversationId, optimisticMessage)
  // scrollToBottom() // Ensure view scrolls if needed

  TRY
    // 2. Optional: Compress Image Client-Side
    // TDD: Test compression logic with different image types/sizes
    compressedFile = AWAIT compressImageIfNeeded(fileObject, { quality: 0.8, maxWidth: 1920, useWebWorker: true }) // Use web worker for large images
    imageBytes = AWAIT fileToByteArray(compressedFile) // Read file into ArrayBuffer/Uint8Array

    // 3. Ensure E2EE Session with partner is established
    sessionStatus = AWAIT KeyManager.establishSession(partnerUserId)
    IF sessionStatus IS FAILURE THEN THROW new Error("Failed to establish session.")

    // 4. Encrypt Image Data (ArrayBuffer)
    // IMPORTANT: This assumes MessageEncryptorDecryptor has a method like encryptBinaryData
    // that correctly handles ArrayBuffer encryption using the Signal session.
    // If libsignal requires specific formatting for attachments, adapt here.
    // encryptedImageDataResult = AWAIT MessageEncryptorDecryptor.encryptBinaryData(partnerUserId, imageBytes)
    // IF encryptedImageDataResult IS FAILURE THEN THROW new Error("Image data encryption failed.")
    // encryptedImageBytes = encryptedImageDataResult.ciphertext // Assuming result structure
    // Placeholder simulation using text encryption on Base64:
    tempEncryptedImageResult = AWAIT MessageEncryptorDecryptor.encryptTextMessage(partnerUserId, CONVERT_TO_BASE64(imageBytes))
    IF tempEncryptedImageResult IS FAILURE THEN THROW new Error("Image data encryption failed (simulated).")
    encryptedImageBytes = CONVERT_FROM_BASE64(tempEncryptedImageResult.ciphertext) // Simulated encrypted bytes

    // 5. Upload Encrypted Bytes to Supabase Storage
    // TDD: Test upload path generation is unique and predictable
    // TDD: Test progress callback updates the optimistic message in the store
    storagePath = `e2ee-attachments/${conversationId}/${optimisticId}_${Date.now()}_${fileObject.name}.encrypted` // Add timestamp for uniqueness
    // Use Blob constructor for upload
    encryptedImageBlobForUpload = new Blob([encryptedImageBytes])

    { data: uploadData, error: uploadError } = AWAIT SupabaseClient.storage
      .from('secure-media') // Ensure this bucket exists and has appropriate policies
      .upload(storagePath, encryptedImageBlobForUpload, {
        cacheControl: '3600',
        upsert: false, // Prevent accidental overwrites
        contentType: 'application/octet-stream' // Generic encrypted data
      }
      // TODO: Wire up progress reporting if Supabase JS client supports it directly in v2/v3
      // onUploadProgress: (progressEvent) => {
      //   progress = progressEvent.loaded / progressEvent.total
      //   MessageStore.updateOptimisticMessageProgress(conversationId, optimisticId, progress)
      // }
     )

    IF uploadError THEN THROW new Error(`Storage upload failed: ${uploadError.message}`)
    LOG "Encrypted image uploaded to:", uploadData.path

    // 6. Prepare Metadata Payload (what the recipient needs to download/decrypt)
    metadata = {
      storagePath: uploadData.path, // Path in Supabase Storage
      filename: fileObject.name,    // Original filename for display/saving
      mimetype: fileObject.type,    // Original MIME type for display/Blob creation
      size: fileObject.size,        // Original file size (optional, for display)
      // Include necessary info for decryption if encryptBinaryData added metadata (e.g., IV, key info specific to this blob)
      // encryptionInfo: encryptedImageDataResult.encryptionInfo // Example
    }
    metadataString = JSON.stringify(metadata)

    // 7. Encrypt Metadata String using standard text message encryption
    // TDD: Test metadata encryption uses the correct session
    encryptedMetadataResult = AWAIT MessageEncryptorDecryptor.encryptTextMessage(partnerUserId, metadataString)
    IF encryptedMetadataResult IS FAILURE THEN THROW new Error("Metadata encryption failed.")

    // 8. Insert IMAGE Message into Supabase 'messages' Table
    messagePayload = {
      conversation_id: conversationId,
      sender_id: currentUserId,
      recipient_id: partnerUserId,
      message_type: 'IMAGE',
      encrypted_content: encryptedMetadataResult.ciphertext, // Base64 encrypted JSON metadata
      signal_message_type: encryptedMetadataResult.signal_message_type, // Type for metadata decryption
      status: 'Sent' // Mark as Sent as DB insert begins
    }
    { data: insertedMessage, error: insertError } = AWAIT SupabaseClient
      .from('messages')
      .insert(messagePayload)
      .select()
      .single()

    IF insertError THEN THROW new Error(`Message insert failed: ${insertError.message}`)

    // 9. Success: Replace Optimistic Message with Real Data from DB
    LOG "Image message record sent successfully:", insertedMessage.id
    // Update the optimistic message in the store with the real ID and data
    finalMessageData = {
        ...insertedMessage, // Data from DB (real ID, timestamps, etc.)
        isOptimistic: false,
        uploadProgress: undefined, // Clear temporary fields
        placeholderDataUrl: placeholderPreviewUrl, // Keep preview URL until real one loads? Or clear? Let's clear.
        isLoadingMedia: false, // No longer loading (sent)
        decryptedContent: null, // Still null for IMAGE type
        decryptedMetadata: metadata // Store parsed metadata locally too? Optional.
    }
    MessageStore.replaceOptimisticMessage(conversationId, optimisticId, finalMessageData)
    // Ensure status is 'Sent'
    MessageStore.updateMessageStatus(conversationId, [insertedMessage.id], 'Sent')

    // Revoke the local preview URL now that the message is sent
    IF placeholderPreviewUrl THEN URL.revokeObjectURL(placeholderPreviewUrl)

    // 10. Update Conversation Metadata (last message, timestamp)
    AWAIT SupabaseClient
        .from('conversations')
        .update({ last_message_id: insertedMessage.id, updated_at: insertedMessage.created_at })
        .eq('id', conversationId)

  CATCH error
    ERROR "Failed to send image:", error.message
    // Update optimistic message status to 'Failed' in the store
    MessageStore.updateMessageStatus(conversationId, [optimisticId], 'Failed', error.message)
    // Keep the local preview URL available in the failed message state? Optional.
    // MessageStore.updateOptimisticMessageData(conversationId, optimisticId, { placeholderDataUrl: placeholderPreviewUrl })
  FINALLY
    // Assume setIsSending(false) is called by the calling component
    // If placeholderPreviewUrl wasn't revoked on success, revoke it here? Needs careful state management.
    // IF placeholderPreviewUrl AND NOT success THEN URL.revokeObjectURL(placeholderPreviewUrl) // Example cleanup
  ENDTRY

ENDFUNCTION
```

---

**2. Receiving an Image**

*   **Trigger:** RealtimeManager receives an `INSERT` event for a message with `message_type: 'IMAGE'`. This function processes the payload.

```pseudocode
ASYNC FUNCTION handleIncomingImageMessage(messagePayload):
  // TDD: Test receiving an IMAGE message payload via Realtime
  // TDD: Test successful decryption of the metadata string
  // TDD: Test handling of metadata decryption failure (update store with error)
  // TDD: Test parsing of the JSON metadata
  // TDD: Test handling of invalid/missing metadata fields (e.g., storagePath)
  // TDD: Test initial update to MessageStore (shows loading state, maybe filename)
  // TDD: Test successful download of the encrypted blob from Supabase Storage
  // TDD: Test handling of Storage download failure (permissions, not found, network)
  // TDD: Test successful decryption of the image blob (using appropriate binary decryption)
  // TDD: Test handling of image blob decryption failure
  // TDD: Test creation of a valid Object URL from the decrypted blob
  // TDD: Test final update to MessageStore (isLoadingMedia=false, mediaUrl set)
  // TDD: Test sending of 'Delivered'/'Read' status updates after successful processing

  LOG "Handling incoming image message:", messagePayload.id
  conversationId = messagePayload.conversation_id
  senderId = messagePayload.sender_id

  // --- Decrypt Metadata ---
  decryptedMetadataString = AWAIT MessageEncryptorDecryptor.decryptMessage(
    senderId,
    { ciphertext: messagePayload.encrypted_content, signal_message_type: messagePayload.signal_message_type }
  )

  IF decryptedMetadataString IS FAILURE THEN
    ERROR "Failed to decrypt image metadata for message:", messagePayload.id
    MessageStore.addOrUpdateMessage(conversationId, {
        ...messagePayload,
        status: 'Failed', // Indicate failure to process
        decryptedContent: "[Metadata Decryption Failed]",
        isLoadingMedia: false,
        mediaError: "Metadata Decryption Failed"
    })
    RETURN // Stop processing this message
  ENDIF

  // --- Parse Metadata ---
  TRY
    metadata = JSON.parse(decryptedMetadataString)
    IF typeof metadata.storagePath !== 'string' OR metadata.storagePath.trim() === '' THEN
        THROW new Error("Missing or invalid storagePath in image metadata")
    ENDIF
    // Validate other fields if necessary (mimetype, filename)
    IF typeof metadata.mimetype !== 'string' THEN metadata.mimetype = 'application/octet-stream' // Default
    IF typeof metadata.filename !== 'string' THEN metadata.filename = 'image' // Default
  CATCH parseError
    ERROR "Failed to parse image metadata:", parseError
    MessageStore.addOrUpdateMessage(conversationId, {
        ...messagePayload,
        status: 'Failed',
        decryptedContent: "[Invalid Metadata]",
        isLoadingMedia: false,
        mediaError: "Invalid Metadata"
    })
    RETURN
  ENDIF

  // --- Initial Store Update (Loading State) ---
  // Add the message to the store, indicating that the media blob is now loading
  MessageStore.addOrUpdateMessage(conversationId, {
      ...messagePayload,
      decryptedMetadata: metadata, // Store parsed metadata
      decryptedContent: null,      // Final image URL not ready yet
      isLoadingMedia: true,        // <<< Mark as loading
      mediaError: null,
      mediaUrl: null               // No URL yet
  })

  // --- Download and Decrypt Blob ---
  TRY
    // 4. Download Encrypted Blob from Supabase Storage
    LOG "Downloading encrypted image from:", metadata.storagePath
    { data: encryptedImageBlobData, error: downloadError } = AWAIT SupabaseClient.storage
      .from('secure-media') // Bucket name must match sender's
      .download(metadata.storagePath) // Returns Blob

    IF downloadError THEN THROW new Error(`Storage download failed: ${downloadError.message}`)
    IF encryptedImageBlobData IS NULL THEN THROW new Error("Storage download returned null.")

    encryptedImageBytes = AWAIT encryptedImageBlobData.arrayBuffer() // Convert Blob to ArrayBuffer

    // 5. Decrypt Image Blob (ArrayBuffer)
    // IMPORTANT: Assumes decryptBinaryData exists and handles ArrayBuffer.
    // It needs the senderId and potentially info from metadata.encryptionInfo
    // decryptedImageBytesResult = AWAIT MessageEncryptorDecryptor.decryptBinaryData(senderId, encryptedImageBytes, metadata.encryptionInfo)
    // IF decryptedImageBytesResult IS FAILURE THEN THROW new Error("Image blob decryption failed.")
    // decryptedBytes = decryptedImageBytesResult.plaintext
    // Placeholder simulation using text decryption on Base64:
    tempDecryptedBase64 = AWAIT MessageEncryptorDecryptor.decryptMessage(senderId, { ciphertext: CONVERT_TO_BASE64(encryptedImageBytes), signal_message_type: 3 }) // Assume type 3? Needs check.
    IF tempDecryptedBase64 IS FAILURE THEN THROW new Error("Image blob decryption failed (simulated).")
    decryptedBytes = CONVERT_FROM_BASE64(tempDecryptedBase64)

    // 6. Create Object URL for Display
    // TDD: Test Object URL creation with correct MIME type from metadata
    imageBlobForUrl = new Blob([decryptedBytes], { type: metadata.mimetype })
    objectUrl = URL.createObjectURL(imageBlobForUrl)
    LOG "Decrypted image blob, created object URL for message:", messagePayload.id

    // 7. Final Message Store Update (Success)
    MessageStore.addOrUpdateMessage(conversationId, {
        ...messagePayload, // Original payload
        id: messagePayload.id, // Ensure ID is present for update
        decryptedMetadata: metadata,
        isLoadingMedia: false, // <<< Loading finished
        mediaError: null,
        mediaUrl: objectUrl // <<< Set the display URL
    })

    // 8. Send 'Delivered' / 'Read' Status Updates
    AWAIT StatusUpdateManager.sendStatusUpdate(messagePayload.id, 'Delivered')
    IF conversationId == RealtimeManager.currentConversationId THEN // Check if conversation is active
       // Consider delaying 'Read' until confirmed visible by IntersectionObserver in UI
       // AWAIT StatusUpdateManager.sendStatusUpdate(messagePayload.id, 'Read')
       LOG "Image received in active conversation, 'Read' status pending visibility."
    ENDIF

  CATCH processError
    ERROR "Failed to process incoming image:", processError.message
    // Update store with error state
    MessageStore.addOrUpdateMessage(conversationId, {
        ...messagePayload, // Original payload
        id: messagePayload.id, // Ensure ID is present for update
        decryptedMetadata: metadata, // Keep metadata if available
        isLoadingMedia: false, // <<< Loading finished (with error)
        mediaError: processError.message, // <<< Set error message
        mediaUrl: null
    })
  ENDTRY

ENDFUNCTION

// --- UI Component (`Messaging.tsx`) Rendering Logic for Image ---
// Inside the message rendering loop:
IF message.message_type == 'IMAGE' THEN
  // TDD: Test rendering loading state for image message (shows placeholder/spinner)
  // TDD: Test rendering error state for image message (shows error icon/message)
  // TDD: Test rendering the final image using message.mediaUrl correctly
  // TDD: Test that the object URL is revoked when the component unmounts or message.mediaUrl changes

  // Effect to revoke the object URL when it's no longer needed
  useEffect(() => {
      currentUrl = message.mediaUrl // Capture the URL for this render
      // Return cleanup function
      RETURN () => {
          IF currentUrl THEN
              LOG "Revoking Object URL:", currentUrl
              URL.revokeObjectURL(currentUrl)
              // Optionally update store to remove the revoked URL?
              // MessageStore.clearMediaUrl(message.conversation_id, message.id)
          ENDIF
      }
  }, [message.mediaUrl]) // Dependency: run cleanup if URL changes or component unmounts

  RETURN (
    <MessageBubble key={message.id} isOwn={isOwnMessage} status={message.status} timestamp={message.created_at}>
      {/* Conditionally render based on loading/error/success state */}
      IF message.isLoadingMedia THEN
        <ImagePlaceholder>
            <LoadingSpinner size="small" />
            {/* Show filename from metadata if available */}
            <FileName>{message.decryptedMetadata?.filename || "Loading image..."}</FileName>
        </ImagePlaceholder>
      ELSE IF message.mediaError THEN
        <ImageError>
            <Icon type="error" />
            {/* Show specific error */}
            <ErrorMessageText>{message.mediaError}</ErrorMessageText>
            <FileName>{message.decryptedMetadata?.filename}</FileName>
        </ImageError>
      ELSE IF message.mediaUrl THEN
        {/* Display the image using the generated object URL */}
        <ImageDisplay src={message.mediaUrl} alt={message.decryptedMetadata?.filename || 'Received image'} />
      ELSE
        {/* Fallback placeholder if something went wrong but no error is set */}
        <ImagePlaceholder>
            <Icon type="image_broken" />
            <FileName>{message.decryptedMetadata?.filename || "Image unavailable"}</FileName>
        </ImagePlaceholder>
      ENDIF
    </MessageBubble>
  )
ENDIF