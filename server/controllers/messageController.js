import Message from "../models/Message.js";
import User from "../models/User.js";
import { io, userSocketMap } from "../server.js";
import cloudinary from "cloudinary"; // Assuming you're using this for image uploads

// ✅ Get all users except logged-in user, along with unseen messages
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;

    const filteredUsers = await User.find({ _id: { $ne: userId } }).select("-password");

    const unseenMessages = {};

    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        senderId: user._id,
        receiverId: userId,
        seen: false
      });

      if (messages.length > 0) {
        unseenMessages[user._id.toString()] = messages.length; // key as string
      }
    });

    await Promise.all(promises);

    // ✅ Send response once, with users and unseenMessages
    res.json({
      success: true,
      users: filteredUsers,
      unseenMessages
    });
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: err.message });
  }
};

// ✅ Get all messages between logged-in user and selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: userId }
      ]
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: userId },
      { seen: true }
    );

    res.json({ success: true, messages });
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: err.message });
  }
};

// ✅ Mark a single message as seen
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id } = req.params;
    await Message.findByIdAndUpdate(id, { seen: true });
    res.json({ success: true });
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: err.message });
  }
};

// ✅ Send message to selected user and emit via socket
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl
    });

    // Emit to recipient via socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (err) {
    console.error(err.message);
    res.json({ success: false, message: err.message });
  }
};
