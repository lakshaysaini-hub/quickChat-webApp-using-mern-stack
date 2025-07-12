import User from "../models/User.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";
import { io, userSocketMap } from "../server.js";

//Get all user except the logged in user
export const getUserForSidebar = async (req, res) => {
  try {
    //get userId after auth middleware
    const userId = req.user._id;

    // filtered users not containing logged user
    const filteredUsers = await User.find({ _id: { $ne: userId } }).select(
      "-password"
    );

    //count number of unseen messages
    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        recieverId: userId,
        seen: false,
      });

      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });

    await Promise.all(promises);

    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;

    const myId = req.user._id;

    //Getting those messages whose sender is selected user and reciever is myId and vice versa

    const messages = await Message.find({
      $or: [
        { senderId: myId, recieverId: selectedUserId },
        {
          senderId: selectedUserId,
          recieverId: myId,
        },
      ],
    });
    // Marking seen property of messages seen true.
    await Message.updateMany(
      { senderId: selectedUserId, recieverId: myId },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

//Api to mark message as seen using message id
//needed when we see single messages in real time
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });

    res.json({ success: true });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};

// Send message to selected user
export const sendMessage = async (req, res) => {
  try {
    //from frontend body
    const { text, image } = req.body;
    //from URL route param
    const recieverId = req.params;
    // from auth Middleware
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      recieverId,
      text,
      image: imageUrl,
    });

    //Emit the new message to the reciever socket
    const recieverSocketId = userSocketMap[recieverId];

    if (recieverSocketId) {
      io.to(recieverId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    console.log(error.message);
    res.json({ success: false, message: error.message });
  }
};
