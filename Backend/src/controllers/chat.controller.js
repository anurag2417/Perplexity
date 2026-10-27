import { generateResponse, generateChatTitle } from "../services/ai.service.js";
import chatModel from "../models/chat.model.js"
import messageModel from "../models/message.model.js";

export async function sendMessage(req, res) {
    try {
        const { message, chat: chatId } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({
                message: "Message is required",
                success: false,
            });
        }

        let chat = null;

        if (!chatId) {
            const title = await generateChatTitle(message);
            chat = await chatModel.create({
                user: req.user.id,
                title
            });
        } else {
            chat = await chatModel.findOne({
                _id: chatId,
                user: req.user.id,
            });

            if (!chat) {
                return res.status(404).json({
                    message: "Chat not found",
                    success: false,
                });
            }
        }

        await messageModel.create({
            chat: chat._id,
            content: message.trim(),
            role: "user"
        });

        const messages = await messageModel.find({ chat: chat._id }).sort({ createdAt: 1 });
        const result = await generateResponse(messages);
        const aiMessage = await messageModel.create({
            chat: chat._id,
            content: result,
            role: "ai"
        });

        return res.status(201).json({
            title: chat.title,
            chat,
            aiMessage
        });
    } catch (error) {
        console.error("Chat response failed:", error);
        return res.status(502).json({
            message: error.message || "Unable to generate a response",
            success: false,
        });
    }

}

export async function getChats(req, res) {
    const user = req.user

    const chats = await chatModel.find({ user: user.id })

    res.status(200).json({
        message: "Chats retrieved successfully",
        chats
    })
}

export async function getMessages(req, res) {
    const { chatId } = req.params;

    const chat = await chatModel.findOne({
        _id: chatId,
        user: req.user.id
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    const messages = await messageModel.find({
        chat: chatId
    })

    res.status(200).json({
        message: "Messages retrieved successfully",
        messages
    })
}

export async function deleteChat(req, res) {

    const { chatId } = req.params;

    const chat = await chatModel.findOneAndDelete({
        _id: chatId,
        user: req.user.id
    })

    await messageModel.deleteMany({
        chat: chatId
    })

    if (!chat) {
        return res.status(404).json({
            message: "Chat not found"
        })
    }

    res.status(200).json({
        message: "Chat deleted successfully"
    })
}