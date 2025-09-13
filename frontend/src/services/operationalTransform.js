// Operational Transform for Real-time Collaborative Editing
// This is the same algorithm used by Google Docs, VS Code Live Share, etc.

class Operation {
  constructor(type, position, text = '', length = 0) {
    this.type = type; // 'insert' or 'delete'
    this.position = position;
    this.text = text;
    this.length = length;
    this.timestamp = Date.now();
  }
}

class OperationalTransform {
  constructor() {
    this.operations = [];
  }

  // Create operation from Monaco editor change
  createOperation(change) {
    const { range, text } = change;
    const startPos = range.startLineNumber;
    const endPos = range.endLineNumber;
    const startCol = range.startColumn;
    const endCol = range.endColumn;

    if (text === '') {
      // Delete operation
      return new Operation('delete', startPos, '', endPos - startPos);
    } else {
      // Insert operation
      return new Operation('insert', startPos, text, text.length);
    }
  }

  // Transform operation against another operation
  transform(op1, op2) {
    if (op1.type === 'insert' && op2.type === 'insert') {
      return this.transformInsertInsert(op1, op2);
    } else if (op1.type === 'insert' && op2.type === 'delete') {
      return this.transformInsertDelete(op1, op2);
    } else if (op1.type === 'delete' && op2.type === 'insert') {
      return this.transformDeleteInsert(op1, op2);
    } else if (op1.type === 'delete' && op2.type === 'delete') {
      return this.transformDeleteDelete(op1, op2);
    }
    return op1;
  }

  // Transform insert against insert
  transformInsertInsert(op1, op2) {
    if (op1.position <= op2.position) {
      return op1;
    } else {
      return new Operation(op1.type, op1.position + op2.length, op1.text, op1.length);
    }
  }

  // Transform insert against delete
  transformInsertDelete(op1, op2) {
    if (op1.position <= op2.position) {
      return op1;
    } else if (op1.position >= op2.position + op2.length) {
      return new Operation(op1.type, op1.position - op2.length, op1.text, op1.length);
    } else {
      // Insert is within deleted range, adjust position
      return new Operation(op1.type, op2.position, op1.text, op1.length);
    }
  }

  // Transform delete against insert
  transformDeleteInsert(op1, op2) {
    if (op1.position < op2.position) {
      return op1;
    } else {
      return new Operation(op1.type, op1.position + op2.length, op1.text, op1.length);
    }
  }

  // Transform delete against delete
  transformDeleteDelete(op1, op2) {
    if (op1.position < op2.position) {
      if (op1.position + op1.length <= op2.position) {
        return op1;
      } else {
        // Overlapping deletes
        const newLength = Math.max(0, op1.length - (op2.position - op1.position));
        return new Operation(op1.type, op1.position, op1.text, newLength);
      }
    } else if (op1.position > op2.position) {
      return new Operation(op1.type, op1.position - op2.length, op1.text, op1.length);
    } else {
      // Same position, return empty operation
      return new Operation(op1.type, op1.position, op1.text, 0);
    }
  }

  // Apply operation to text
  applyOperation(text, operation) {
    if (operation.type === 'insert') {
      return text.slice(0, operation.position) + operation.text + text.slice(operation.position);
    } else if (operation.type === 'delete') {
      return text.slice(0, operation.position) + text.slice(operation.position + operation.length);
    }
    return text;
  }

  // Get text changes from Monaco editor
  getTextChanges(oldText, newText) {
    const changes = [];
    let i = 0;
    let j = 0;

    while (i < oldText.length || j < newText.length) {
      if (i >= oldText.length) {
        // Insert remaining characters
        changes.push(new Operation('insert', i, newText.slice(j), newText.length - j));
        break;
      } else if (j >= newText.length) {
        // Delete remaining characters
        changes.push(new Operation('delete', i, '', oldText.length - i));
        break;
      } else if (oldText[i] === newText[j]) {
        i++;
        j++;
      } else {
        // Find the next matching character
        let nextMatch = -1;
        for (let k = j + 1; k < newText.length; k++) {
          if (oldText[i] === newText[k]) {
            nextMatch = k;
            break;
          }
        }

        if (nextMatch === -1) {
          // No match found, delete current character
          changes.push(new Operation('delete', i, '', 1));
          i++;
        } else {
          // Insert characters until match
          changes.push(new Operation('insert', i, newText.slice(j, nextMatch), nextMatch - j));
          j = nextMatch;
        }
      }
    }

    return changes;
  }
}

export default OperationalTransform;
