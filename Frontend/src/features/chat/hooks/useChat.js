import { initializeSocketConnection } from "../service/chat.socket";
import { sendMessage, getChats, getMessages, deleteChat } from "../service/chat.api";
import { setChats, setCurrentChatId, setError, setLoading, createNewChat, addNewMessage, addMessages, removeChat } from "../chat.slice";
import { useDispatch } from "react-redux";
import { useCallback, useMemo } from "react";


export const useChat = () => {

    const dispatch = useDispatch()


    const handleSendMessage = useCallback(async ({ message, chatId }) => {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            const data = await sendMessage({ message, chatId })
            const { chat, aiMessage } = data
            if (!chatId) {
                dispatch(createNewChat({
                    chatId: chat._id,
                    title: chat.title,
                }))
            }
            dispatch(addNewMessage({
                chatId: chatId || chat._id,
                content: message,
                role: "user",
            }))
            dispatch(addNewMessage({
                chatId: chatId || chat._id,
                content: aiMessage.content,
                role: aiMessage.role,
            }))
            dispatch(setCurrentChatId(chat._id))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Failed to send message"))
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const handleGetChats = useCallback(async () => {
        try {
            dispatch(setLoading(true))
            const data = await getChats()
            const { chats } = data
            dispatch(setChats(chats.reduce((acc, chat) => {
                acc[ chat._id ] = {
                    id: chat._id,
                    title: chat.title,
                    messages: [],
                    lastUpdated: chat.updatedAt,
                }
                return acc
            }, {})))
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Failed to load chats"))
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    const handleOpenChat = useCallback(async (chatId, chats) => {

        try {
            if (chats[ chatId ]?.messages.length === 0) {
                const data = await getMessages(chatId)
                const { messages } = data

                const formattedMessages = messages.map(msg => ({
                    content: msg.content,
                    role: msg.role,
                }))

                dispatch(addMessages({
                    chatId,
                    messages: formattedMessages,
                }))
            }
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Failed to load messages"))
        }
        dispatch(setCurrentChatId(chatId))
    }, [dispatch])

    const handleDeleteChat = useCallback(async (chatId) => {
        try {
            dispatch(setLoading(true))
            dispatch(setError(null))
            await deleteChat(chatId)
            dispatch(removeChat(chatId))
            return true
        } catch (error) {
            dispatch(setError(error.response?.data?.message || "Failed to delete chat"))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }, [dispatch])

    return useMemo(() => ({
        initializeSocketConnection,
        handleSendMessage,
        handleGetChats,
        handleOpenChat,
        handleDeleteChat
    }), [handleDeleteChat, handleGetChats, handleOpenChat, handleSendMessage])

}