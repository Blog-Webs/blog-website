const EventEmitter = require('events');

class AppEventBus extends EventEmitter {}

// Create a singleton instance of the EventBus
const eventBus = new AppEventBus();

// Increase max listeners if needed later
eventBus.setMaxListeners(20);

module.exports = eventBus;
