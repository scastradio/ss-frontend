// Preset task images for visual schedules
// These are placeholder URLs - in a real app, you'd have actual image files
export const PRESET_TASK_IMAGES = {
  // Daily routines
  brushTeeth: 'https://images.unsplash.com/photo-1559059963-2e19b6c70293?w=64&h=64&fit=crop&auto=format',
  bath: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=64&h=64&fit=crop&auto=format',
  eat: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=64&h=64&fit=crop&auto=format',
  sleep: 'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?w=64&h=64&fit=crop&auto=format',

  // Activities
  read: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=64&h=64&fit=crop&auto=format',
  play: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=64&h=64&fit=crop&auto=format',
  draw: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=64&h=64&fit=crop&auto=format',
  music: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=64&h=64&fit=crop&auto=format',

  // Outdoor activities
  walk: 'https://images.unsplash.com/photo-1544717297-fa95b6ee9643?w=64&h=64&fit=crop&auto=format',
  bike: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=64&h=64&fit=crop&auto=format',
  park: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=64&h=64&fit=crop&auto=format',

  // Chores
  clean: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=64&h=64&fit=crop&auto=format',
  laundry: 'https://images.unsplash.com/photo-1545177586-9b8b0a7c6b8a?w=64&h=64&fit=crop&auto=format',
  dishes: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=64&h=64&fit=crop&auto=format',

  // Learning
  school: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=64&h=64&fit=crop&auto=format',
  homework: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=64&h=64&fit=crop&auto=format',
  computer: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=64&h=64&fit=crop&auto=format',

  // Default
  default: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=64&h=64&fit=crop&auto=format'
}

// Get a random preset image
export const getRandomPresetImage = () => {
  const images = Object.values(PRESET_TASK_IMAGES)
  return images[Math.floor(Math.random() * images.length)]
}

// Get image by category
export const getImageByCategory = (category) => {
  const categoryMap = {
    hygiene: PRESET_TASK_IMAGES.brushTeeth,
    bath: PRESET_TASK_IMAGES.bath,
    food: PRESET_TASK_IMAGES.eat,
    sleep: PRESET_TASK_IMAGES.sleep,
    learning: PRESET_TASK_IMAGES.school,
    play: PRESET_TASK_IMAGES.play,
    outdoor: PRESET_TASK_IMAGES.park,
    chores: PRESET_TASK_IMAGES.clean
  }

  return categoryMap[category] || PRESET_TASK_IMAGES.default
}
