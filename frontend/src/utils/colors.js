// src/utils/colors.js

// Array of colors for user avatars
const colors = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Gold
    '#BB8FCE', // Light Purple
    '#85C1E9', // Light Blue
    '#F8C471', // Orange
    '#82E0AA', // Light Green
    '#F1948A', // Light Red
    '#85C1E9', // Sky Blue
    '#D7BDE2', // Lavender
    '#A9DFBF', // Light Mint
  ];
  
  /**
   * Get a consistent random color for a given string (like userId)
   * This ensures the same user always gets the same color
   */
  export const getRandomColor = (str) => {
    if (!str) return colors[0];
    
    // Simple hash function to convert string to number
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Use hash to select color
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };
  
  /**
   * Get a truly random color (not consistent)
   */
  export const getRandomColorUnstable = () => {
    return colors[Math.floor(Math.random() * colors.length)];
  };
  
  /**
   * Get all available colors
   */
  export const getAllColors = () => {
    return [...colors];
  };