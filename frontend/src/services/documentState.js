// Document State Manager for Real-time Collaboration
// Manages document state, operations, and conflict resolution

class DocumentState {
  constructor(documentId, userId) {
    this.documentId = documentId;
    this.userId = userId;
    this.content = '';
    this.operations = [];
    this.pendingOperations = [];
    this.lastAppliedOperation = null;
    this.isApplyingRemote = false;
  }

  // Add local operation
  addLocalOperation(operation) {
    this.operations.push(operation);
    this.content = this.applyOperation(this.content, operation);
    return operation;
  }

  // Add remote operation with transformation
  addRemoteOperation(operation, transformFunction) {
    if (this.isApplyingRemote) {
      this.pendingOperations.push(operation);
      return operation;
    }

    this.isApplyingRemote = true;

    try {
      // Transform operation against all local operations
      let transformedOperation = operation;
      for (const localOp of this.operations) {
        if (localOp.timestamp > operation.timestamp) {
          transformedOperation = transformFunction(transformedOperation, localOp);
        }
      }

      // Apply transformed operation
      this.content = this.applyOperation(this.content, transformedOperation);
      this.operations.push(transformedOperation);

      // Process pending operations
      this.processPendingOperations(transformFunction);

      return transformedOperation;

    } finally {
      this.isApplyingRemote = false;
    }
  }

  // Process pending operations
  processPendingOperations(transformFunction) {
    while (this.pendingOperations.length > 0) {
      const operation = this.pendingOperations.shift();
      this.addRemoteOperation(operation, transformFunction);
    }
  }

  // Apply operation to content
  applyOperation(content, operation) {
    if (operation.type === 'insert') {
      return content.slice(0, operation.position) + operation.text + content.slice(operation.position);
    } else if (operation.type === 'delete') {
      return content.slice(0, operation.position) + content.slice(operation.position + operation.length);
    }
    return content;
  }

  // Get content
  getContent() {
    return this.content;
  }

  // Set content
  setContent(content) {
    this.content = content;
  }

  // Get operations since timestamp
  getOperationsSince(timestamp) {
    return this.operations.filter(op => op.timestamp > timestamp);
  }

  // Clear operations
  clearOperations() {
    this.operations = [];
  }

  // Get last operation
  getLastOperation() {
    return this.operations[this.operations.length - 1];
  }

  // Check if operation is from current user
  isFromCurrentUser(operation) {
    return operation.userId === this.userId;
  }

  // Merge operations
  mergeOperations(operations) {
    // Sort operations by timestamp
    const sortedOps = operations.sort((a, b) => a.timestamp - b.timestamp);
    
    // Apply operations in order
    for (const op of sortedOps) {
      this.content = this.applyOperation(this.content, op);
    }
    
    this.operations = sortedOps;
  }

  // Get document state for sync
  getState() {
    return {
      content: this.content,
      operations: this.operations,
      lastOperation: this.getLastOperation()
    };
  }

  // Restore document state
  restoreState(state) {
    this.content = state.content;
    this.operations = state.operations || [];
  }
}

export default DocumentState;
