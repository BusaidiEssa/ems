// Force Mongoose + ESM compatibility
import mongoose from 'mongoose'

// Import ALL models here
import './models/User.js'
import './models/Event.js'
import './models/Registration.js'
import './models/EmailLog.js'
import './models/StakeholderGroup.js'

console.log('✅ All models imported successfully')

// //test db connection
// const MONGO_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/model_test'

// await mongoose.connect(MONGO_URI)
// console.log('✅ MongoDB connected')

// // Close connection
// await mongoose.disconnect()
// console.log('✅ MongoDB disconnected')
