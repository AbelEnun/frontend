import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Background from './components/Background';
import WelcomeBanner from './components/WelcomeBanner';
import ChatInterface from './components/ChatInterface';
import InputArea from './components/InputArea';
import FlightResults from './components/FlightResults';
import Sidebar from './components/Sidebar';
import FlightFilters from './components/FlightFilters';
import FlightDetails from './components/FlightDetails';
import { Sparkles, RotateCw, Moon, Sun, Menu, User, Plane } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "./components/ui/dialog";
import { API_URL, BACKEND_URL } from './config';

const generateId = () => Math.random().toString(36).substr(2, 9);

/* ── Hardcoded Ethiopia Tour Data ── */
const ETHIOPIA_TOUR = {
    id: 'ETHS22',
    country: 'Ethiopia',
    city: 'Addis Ababa',
    title: 'Full Day Addis Ababa City Tour',
    code: 'ETHS22',
    duration: '1 Day',
    introduction: 'Addis Ababa is a vibrant and fast-growing capital city of Ethiopia with over 6 million people. It is known as the diplomatic capital of Africa, hosting the African Union, UNECA, and over 120 embassies. The city offers rich culture, traditional cuisine, local markets, and unique coffee experiences.',
    included: [
        'English-speaking professional guide',
        'All entrance fees',
        'Lunch at a local restaurant',
        'Bottled water',
        'Traditional Ethiopian coffee',
        'Ground transportation (Seat-In-Coach)',
    ],
    notIncluded: ['Any additional personal expenses not listed'],
    pricing: [
        { persons: '1 person', price: 152 },
        { persons: '2 persons', price: 112 },
        { persons: '3–4 persons', price: 106 },
        { persons: '5–6 persons', price: 92 },
    ],
    addOns: [
        { id: 'sleeping_bag', name: 'Sleeping bag rental', price: 25 },
        { id: 'portal_vip', name: 'Portal (VIP) service', price: 40 },
        { id: 'evisa', name: 'E-visa processing', price: 80 },
    ],
    childPolicy: {
        under5: 'Free',
        age5to12: '50% discount',
    },
    notes: [
        'Extra $60 for non-English speaking guides',
        'Two ticket types available: Regular Ticket (General access) and Special Ticket (Includes exclusive historical exhibits)',
    ],
    availability: {
        from: 'March 17, 2026',
        to: 'July 31, 2026',
    },
    contact: 'An Ethiopian Holidays representative will meet and assist the traveler.',
};

const getPricePerPerson = (numTravelers) => {
    if (numTravelers === 1) return 152;
    if (numTravelers === 2) return 112;
    if (numTravelers <= 4) return 106;
    if (numTravelers <= 6) return 92;
    return 92;
};

function App() {
    const [view, setView] = useState('home');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isSidebarVisible, setIsSidebarVisible] = useState(false);
    const [isDark, setIsDark] = useState(false);
    const [selectedFlightDetails, setSelectedFlightDetails] = useState(null);

    useEffect(() => {
        if (view === 'home') {
            setIsSidebarVisible(false);
        } else {
            setIsSidebarVisible(true);
        }
    }, [view]);

    // Chat Session Management
    const [chats, setChats] = useState(() => {
        const saved = localStorage.getItem('flight_chats_v2');
        return saved ? JSON.parse(saved) : [];
    });

    const [currentChatId, setCurrentChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [history, setHistory] = useState([]);
    const [flightResults, setFlightResults] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [searchProgress, setSearchProgress] = useState(null);
    const [progressPercent, setProgressPercent] = useState(0);
    const [filters, setFilters] = useState({ sortBy: null, stops: null, airline: null, time: null });
    const [previewFlight, setPreviewFlight] = useState(null);

    // ── In-Chat Booking State ──
    const [bookingFlight, setBookingFlight] = useState(null);
    const [passengerData, setPassengerData] = useState(null);

    // ── Tourism State ──
    const [tourismState, setTourismState] = useState(null);
    const [tourismData, setTourismData] = useState({
        tour: null,
        travelers: 0,
        pricePerPerson: 0,
        selectedAddOns: [],
        grandTotal: 0,
    });

    // Favorites Management
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('simba_favorites_v3');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('simba_favorites_v3', JSON.stringify(favorites));
    }, [favorites]);

    const toggleFavorite = (flight) => {
        setFavorites(prev => {
            const exists = prev.find(f => f.id === flight.id);
            if (exists) {
                return prev.filter(f => f.id !== flight.id);
            }
            return [flight, ...prev];
        });
    };

    const ensureUniqueIds = (results) => {
        if (!results || !Array.isArray(results.offers)) return results;
        return {
            ...results,
            offers: results.offers.map((o, i) => {
                if (o.id && String(o.id).startsWith('flt_')) return o;
                const compositeKey = `${o.airline || 'UNK'}-${o.departureTime || 'DEP'}-${o.arrivalTime || 'ARR'}-${o.price || '0'}-${i}`;
                const hash = compositeKey.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
                return { ...o, id: `flt_${Math.abs(hash)}_${i}` };
            })
        };
    };

    useEffect(() => {
        if (currentChatId) {
            const chat = chats.find(c => c.id === currentChatId);
            if (chat) {
                setMessages(chat.messages || []);
                setHistory(chat.history || []);
                setFlightResults(ensureUniqueIds(chat.lastResults));
                setShowResults(false);
                // Restore tourism state
                setTourismState(chat.tourismState || null);
                setTourismData(chat.tourismData || { tour: null, travelers: 0, pricePerPerson: 0, selectedAddOns: [], grandTotal: 0 });
            }
        } else {
            setMessages([]);
            setHistory([]);
            setFlightResults(null);
            setShowResults(false);
            setTourismState(null);
            setTourismData({ tour: null, travelers: 0, pricePerPerson: 0, selectedAddOns: [], grandTotal: 0 });
        }
    }, [currentChatId, chats]);

    useEffect(() => {
        localStorage.setItem('flight_chats_v2', JSON.stringify(chats));
    }, [chats]);

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDark]);

    const resetAllStates = () => {
        setMessages([]);
        setHistory([]);
        setFlightResults(null);
        setShowResults(false);
        setFilters({ sortBy: null, stops: null, airline: null, time: null });
        setTourismState(null);
        setTourismData({ tour: null, travelers: 0, pricePerPerson: 0, selectedAddOns: [], grandTotal: 0 });
        setBookingFlight(null);
        setPassengerData(null);
        setCurrentChatId(null);
    };

    const createNewChat = () => {
        resetAllStates();
        setView('home');
        setIsSidebarOpen(false);
    };

    const deleteChat = (id) => {
        setChats(prev => prev.filter(c => c.id !== id));
        if (currentChatId === id) {
            setCurrentChatId(null);
            setView('home');
        }
    };

    const updateChatTitle = (id, newTitle) => {
        setChats(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
    };

    const toggleSidebar = () => {
        if (window.innerWidth < 768) {
            setIsSidebarOpen(!isSidebarOpen);
        } else {
            setIsSidebarVisible(!isSidebarVisible);
        }
    };

    /* ═══════════════════════════════════════
       TOURISM FLOW
    ═══════════════════════════════════════ */

    const addBotMessage = (content, extras = {}, chatId = null) => {
        const activeChatId = chatId || currentChatId;
        const botMsg = { role: 'assistant', content, animate: true, ...extras };
        setMessages(prev => [...prev, botMsg]);
        setChats(prev => prev.map(chat =>
            chat.id === activeChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, botMsg],
                    history: [...chat.history, { role: 'assistant', content }],
                    tourismState: tourismState,
                    tourismData: tourismData,
                }
                : chat
        ));
        return botMsg;
    };

    const addUserMessage = (text, chatId = null) => {
        const activeChatId = chatId || currentChatId;
        const userMsg = { role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setChats(prev => prev.map(chat =>
            chat.id === activeChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, userMsg],
                    history: [...chat.history, { role: 'user', content: text }],
                }
                : chat
        ));
    };

    const handleStartTourism = () => {
        resetAllStates();
        const newId = generateId();
        const greetingMsg = {
            role: 'assistant',
            content: "Great choice! 🌍 Which country would you like to explore?",
            animate: true,
            buttons: ['🇪🇹 Ethiopia'],
        };

        const newChat = {
            id: newId,
            title: '🌍 Tourism Experience',
            createdAt: new Date().toISOString(),
            messages: [greetingMsg],
            history: [{ role: 'assistant', content: greetingMsg.content }],
            lastResults: null,
            tourismState: 'AWAITING_COUNTRY',
            tourismData: { tour: null, travelers: 0, pricePerPerson: 0, selectedAddOns: [], grandTotal: 0 },
        };

        setChats(prev => [newChat, ...prev]);
        setCurrentChatId(newId);
        setMessages([greetingMsg]);
        setHistory([{ role: 'assistant', content: greetingMsg.content }]);
        setTourismState('AWAITING_COUNTRY');
        setTourismData({ tour: null, travelers: 0, pricePerPerson: 0, selectedAddOns: [], grandTotal: 0 });
        setFlightResults(null);
        setShowResults(false);
        setView('chat');
        setIsSidebarOpen(false);
    };

    const handleTourismMessage = (text, activeChatId) => {
        const lower = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();

        if (tourismState === 'AWAITING_COUNTRY') {
            if (lower.includes('ethiopia') || lower.includes('addis')) {
                setTourismState('SHOWING_PACKAGE');
                setTourismData(prev => ({ ...prev, tour: ETHIOPIA_TOUR }));

                // Update chat tourism state
                setChats(prev => prev.map(chat =>
                    chat.id === activeChatId
                        ? { ...chat, tourismState: 'SHOWING_PACKAGE', tourismData: { ...tourismData, tour: ETHIOPIA_TOUR } }
                        : chat
                ));

                // Show tour package card
                const introMsg = {
                    role: 'assistant',
                    content: `Excellent choice! 🇪🇹 Here's an amazing tour package for Addis Ababa:`,
                    animate: true,
                };
                const packageMsg = {
                    role: 'assistant',
                    content: '',
                    type: 'tour_package',
                    tourData: ETHIOPIA_TOUR,
                    animate: true,
                };
                const ctaMsg = {
                    role: 'assistant',
                    content: `Would you like to book this tour or add extra services? 😊`,
                    animate: true,
                    buttons: ['📝 Book This Tour', '➕ Add Extra Services'],
                };

                setMessages(prev => [...prev, introMsg, packageMsg, ctaMsg]);
                setChats(prev => prev.map(chat =>
                    chat.id === activeChatId
                        ? {
                            ...chat,
                            messages: [...chat.messages, introMsg, packageMsg, ctaMsg],
                            history: [...chat.history,
                                { role: 'assistant', content: introMsg.content },
                                { role: 'assistant', content: 'Tour package details displayed.' },
                                { role: 'assistant', content: ctaMsg.content },
                            ],
                            tourismState: 'SHOWING_PACKAGE',
                            tourismData: { ...tourismData, tour: ETHIOPIA_TOUR },
                        }
                        : chat
                ));
            } else {
                // Country not available
                const notAvailable = {
                    role: 'assistant',
                    content: `I currently have a curated tour package for Ethiopia 🇪🇹 — featuring an incredible full-day Addis Ababa city tour!\n\nWould you like to explore it?`,
                    animate: true,
                    buttons: ['🇪🇹 Ethiopia'],
                };
                setMessages(prev => [...prev, notAvailable]);
                setChats(prev => prev.map(chat =>
                    chat.id === activeChatId
                        ? {
                            ...chat,
                            messages: [...chat.messages, notAvailable],
                            history: [...chat.history, { role: 'assistant', content: notAvailable.content }],
                        }
                        : chat
                ));
            }
        } else if (tourismState === 'SHOWING_PACKAGE') {
            if (lower.includes('book') || lower.includes('yes') || lower.includes('extra') || lower.includes('add')) {
                setTourismState('AWAITING_TRAVELERS');
                setChats(prev => prev.map(chat =>
                    chat.id === activeChatId ? { ...chat, tourismState: 'AWAITING_TRAVELERS' } : chat
                ));

                const travelersMsg = {
                    role: 'assistant',
                    content: `Great! Let's get your booking started! 🎉\n\nHow many travelers will be joining this tour?`,
                    animate: true,
                    buttons: ['1', '2', '3', '4', '5', '6'],
                };

                setMessages(prev => [...prev, travelersMsg]);
                setChats(prev => prev.map(chat =>
                    chat.id === activeChatId
                        ? {
                            ...chat,
                            messages: [...chat.messages, travelersMsg],
                            history: [...chat.history, { role: 'assistant', content: travelersMsg.content }],
                        }
                        : chat
                ));
            }
        } else if (tourismState === 'AWAITING_TRAVELERS') {
            const numMatch = text.match(/\d+/);
            const numTravelers = numMatch ? Math.min(Math.max(parseInt(numMatch[0]), 1), 6) : 1;
            const pricePerPerson = getPricePerPerson(numTravelers);
            const baseTotal = numTravelers * pricePerPerson;

            const newTourismData = {
                ...tourismData,
                tour: ETHIOPIA_TOUR,
                travelers: numTravelers,
                pricePerPerson,
                grandTotal: baseTotal,
            };
            setTourismData(newTourismData);
            setTourismState('AWAITING_PASSPORT');

            const priceSummary = {
                role: 'assistant',
                content: `For ${numTravelers} traveler${numTravelers > 1 ? 's' : ''} at $${pricePerPerson}/person, the base tour cost is $${baseTotal}.\n\nTo proceed with the booking, I'll need to verify your passport. Please upload a photo of your passport data page — I'll extract your details automatically. 📷`,
                animate: true,
                type: 'passport_upload',
            };

            setMessages(prev => [...prev, priceSummary]);
            setChats(prev => prev.map(chat =>
                chat.id === activeChatId
                    ? {
                        ...chat,
                        messages: [...chat.messages, priceSummary],
                        history: [...chat.history, { role: 'assistant', content: priceSummary.content }],
                        tourismState: 'AWAITING_PASSPORT',
                        tourismData: newTourismData,
                    }
                    : chat
            ));
        }
    };

    const handleTourPassportScanned = (passportInfo) => {
        setPassengerData(passportInfo);

        // Mark passport upload as completed
        setMessages(prev => prev.map(msg =>
            msg.type === 'passport_upload' && !msg.completed ? { ...msg, completed: true } : msg
        ));

        const confirmMsg = {
            role: 'assistant',
            content: `I've successfully read your passport! Here's what I found:`,
            type: 'passport_confirmed',
            passportData: passportInfo,
        };

        // Show add-ons selector
        const addOnsMsg = {
            role: 'assistant',
            content: `Now, would you like to add any optional services to enhance your experience? Select any extras below, or continue to payment.`,
            type: 'tour_addons',
            addOnsData: {
                addOns: ETHIOPIA_TOUR.addOns,
                travelers: tourismData.travelers,
                pricePerPerson: tourismData.pricePerPerson,
            },
        };

        setTourismState('AWAITING_ADDONS');
        setMessages(prev => [...prev, confirmMsg, addOnsMsg]);
        setChats(prev => prev.map(chat =>
            chat.id === currentChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, confirmMsg, addOnsMsg],
                    history: [...chat.history,
                        { role: 'assistant', content: confirmMsg.content },
                        { role: 'assistant', content: addOnsMsg.content },
                    ],
                    tourismState: 'AWAITING_ADDONS',
                }
                : chat
        ));
    };

    const handleTourAddOnsSelected = (selectedAddOns, grandTotal) => {
        const newTourismData = {
            ...tourismData,
            selectedAddOns,
            grandTotal,
        };
        setTourismData(newTourismData);
        setTourismState('AWAITING_PAYMENT');

        // Mark add-ons as completed
        setMessages(prev => prev.map(msg =>
            msg.type === 'tour_addons' && !msg.completed ? { ...msg, completed: true } : msg
        ));

        // Create a tour object compatible with InlinePaymentForm
        const tourAsFlight = {
            origin: 'ADD',
            destination: 'Addis Ababa',
            airline: 'Ethiopian Holidays',
            airlineCode: 'ET',
            totalPrice: grandTotal,
            price: grandTotal,
            trip_type: 'Tour Package',
            flightNumber: 'ETHS22',
            tourTitle: ETHIOPIA_TOUR.title,
            tourCode: ETHIOPIA_TOUR.code,
        };

        // Tour booking handler - simulates successful payment
        const tourBookingHandler = async (cardData, formData) => {
            // Simulate payment processing
            await new Promise(r => setTimeout(r, 2000));
            const ref = `ETH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            return { success: true, bookingRef: ref };
        };

        const addOnsSummary = selectedAddOns.length > 0
            ? `\n\nSelected add-ons: ${selectedAddOns.map(a => a.name).join(', ')}`
            : '\n\nNo add-ons selected.';

        const paymentMsg = {
            role: 'assistant',
            content: `Total: $${grandTotal}${addOnsSummary}\n\nPlease enter your contact info and payment details below to finalize the booking.`,
            type: 'payment_form',
            flight: tourAsFlight,
            passengerData: passengerData,
            bookingHandler: tourBookingHandler,
        };

        setMessages(prev => [...prev, paymentMsg]);
        setChats(prev => prev.map(chat =>
            chat.id === currentChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, paymentMsg],
                    history: [...chat.history, { role: 'assistant', content: paymentMsg.content }],
                    tourismState: 'AWAITING_PAYMENT',
                    tourismData: newTourismData,
                }
                : chat
        ));
    };

    const handleTourBookingComplete = (bookingRef, email, phone) => {
        // Mark payment form as completed
        setMessages(prev => prev.map(msg =>
            msg.type === 'payment_form' && !msg.completed ? { ...msg, completed: true } : msg
        ));

        const confirmMsg = {
            role: 'assistant',
            content: `Your tour is booked! 🎉 Confirmation sent to ${email || 'your email'}.\n\nAn Ethiopian Holidays representative will meet and assist you on arrival. Have a wonderful trip! ✨`,
            type: 'booking_confirmed',
            isTour: true,
            bookingRef: bookingRef,
            flight: {
                origin: 'ADD',
                destination: 'Addis Ababa',
                airline: 'Ethiopian Holidays',
                airlineCode: 'ET',
                totalPrice: tourismData.grandTotal,
                price: tourismData.grandTotal,
                tourTitle: ETHIOPIA_TOUR.title,
                tourCode: ETHIOPIA_TOUR.code,
            },
            travelerInfo: { email, phone },
        };

        setTourismState('COMPLETED');
        setMessages(prev => [...prev, confirmMsg]);
        setChats(prev => prev.map(chat =>
            chat.id === currentChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, confirmMsg],
                    history: [...chat.history, { role: 'assistant', content: confirmMsg.content }],
                    tourismState: 'COMPLETED',
                }
                : chat
        ));
        setPassengerData(null);
    };

    /* ═══════════════════════════════════════
       FLIGHT FLOW (Existing)
    ═══════════════════════════════════════ */

    const handleStartChat = (queryOrObj) => {
        const isObj = queryOrObj && typeof queryOrObj === 'object';
        const query = isObj ? queryOrObj.query : queryOrObj;
        const structuredFields = isObj ? queryOrObj : {};

        if (typeof query === 'string' && query.length > 0) {
            resetAllStates();
            const newId = generateId();
            const initialText = query === 'flights' ? "I want to search for flights" :
                query === 'hotels' ? "I'm looking for a hotel" :
                    query === 'cars' ? "I need to rent a car" : query;

            const newChat = {
                id: newId,
                title: initialText.length > 40 ? initialText.slice(0, 40) + '…' : initialText,
                createdAt: new Date().toISOString(),
                messages: [{ role: 'user', content: initialText }],
                history: [{ role: 'user', content: initialText }],
                lastResults: null
            };

            setChats(prev => [newChat, ...prev]);
            setCurrentChatId(newId);
            setMessages([{ role: 'user', content: initialText }]);
            setHistory([{ role: 'user', content: initialText }]);
            setView('chat');
            setIsSidebarOpen(false);

            performSearch(initialText, [], newId, structuredFields);
        } else {
            if (!currentChatId) createNewChat();
            setView('chat');
        }
    };

    const handleSend = async (textOrObj) => {
        const isObj = textOrObj && typeof textOrObj === 'object';
        const text = isObj ? textOrObj.query : textOrObj;
        const structuredFields = isObj ? textOrObj : {};

        if (!text || typeof text !== 'string' || !text.trim()) return;

        let activeChatId = currentChatId;

        if (!activeChatId) {
            const newId = generateId();
            const newChat = {
                id: newId,
                title: text.length > 40 ? text.slice(0, 40) + '…' : text,
                createdAt: new Date().toISOString(),
                messages: [{ role: 'user', content: text }],
                history: [{ role: 'user', content: text }],
                lastResults: null
            };
            setChats(prev => [newChat, ...prev]);
            setCurrentChatId(newId);
            activeChatId = newId;
        } else {
            setMessages(prev => [...prev, { role: 'user', content: text }]);
            setChats(prev => prev.map(chat => {
                if (chat.id === activeChatId) {
                    const updatedChat = {
                        ...chat,
                        messages: [...chat.messages, { role: 'user', content: text }],
                        history: [...chat.history, { role: 'user', content: text }]
                    };
                    const isFirstMessage = chat.messages.length === 0;
                    const hasDefaultTitle = chat.title === 'New Conversation' || chat.title === '';
                    if (isFirstMessage || hasDefaultTitle) {
                        updatedChat.title = text.length > 40 ? text.slice(0, 40) + '…' : text;
                    }
                    return updatedChat;
                }
                return chat;
            }));
        }

        if (view !== 'chat') setView('chat');

        // ── Tourism Mode: handle locally ──
        if (tourismState && tourismState !== 'COMPLETED') {
            handleTourismMessage(text, activeChatId);
            return;
        }

        // ── Flight Mode: call API ──
        performSearch(text, history, activeChatId, structuredFields);
    };

    const performSearch = async (text, currentHistory, activeChatId, structuredFields = {}) => {
        setIsLoading(true);
        setFlightResults(null);
        setShowResults(false);
        setProgressPercent(0);

        const progressStates = [
            { msg: 'Thinking… Understanding your trip plan', percent: 25 },
            { msg: 'Finding best matches based on your criteria', percent: 50 },
            { msg: 'Finalizing your options…', percent: 85 },
            { msg: 'Flight results ready', percent: 100 }
        ];

        for (let i = 0; i < progressStates.length; i++) {
            setSearchProgress(progressStates[i].msg);
            setProgressPercent(progressStates[i].percent);
            await new Promise(r => setTimeout(r, 600));
        }

        try {
            const backendMessage = `${text}\n\n[SYSTEM DIRECTION: DO NOT under any circumstances ask for the user's nationality, passport, or visa requirements. Skip those checks entirely and proceed directly to providing travel recommendations and flight details.]`;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: backendMessage,
                    history: currentHistory,
                    sessionId: activeChatId,
                    ...(structuredFields.origin_iata && { origin_iata: structuredFields.origin_iata }),
                    ...(structuredFields.destination_iata && { destination_iata: structuredFields.destination_iata }),
                    ...(structuredFields.departure_date && { departure_date: structuredFields.departure_date }),
                    ...(structuredFields.return_date && { return_date: structuredFields.return_date }),
                    ...(structuredFields.trip_type && { trip_type: structuredFields.trip_type }),
                })
            });

            const cleanBotContent = (str) => {
                if (!str) return "";
                let cleaned = str.replace(/^\{.*?\}\s*/s, '');
                cleaned = cleaned.replace(/\s*\{.*?\}$/s, '');
                return cleaned.trim();
            };

            if (!response.ok) throw new Error('Failed to search');
            let data = await response.json();

            if (data && typeof data.body === 'string') {
                try { data = JSON.parse(data.body); } catch (e) { console.error('Failed to parse response body:', e); }
            } else if (data && typeof data.body === 'object' && data.body !== null) {
                data = data.body;
            }

            // --- Natural Language Filter Extraction ---
            const lowerText = text.toLowerCase();
            const extractedFilters = { ...filters };
            const detectedKeywords = [];

            if (lowerText.includes('nonstop') || lowerText.includes('non-stop') || lowerText.includes('direct')) {
                extractedFilters.stops = '0'; detectedKeywords.push('Nonstop');
            } else if (lowerText.includes('1 stop') || lowerText.includes('one stop')) {
                extractedFilters.stops = '1'; detectedKeywords.push('1 Stop');
            } else if (lowerText.includes('2 stop') || lowerText.includes('2+ stop')) {
                extractedFilters.stops = '2+'; detectedKeywords.push('2+ Stops');
            }

            if (lowerText.includes('morning')) {
                extractedFilters.time = 'morning'; detectedKeywords.push('Morning');
            } else if (lowerText.includes('noon') || lowerText.includes('afternoon')) {
                extractedFilters.time = 'afternoon'; detectedKeywords.push('Afternoon/Noon');
            } else if (lowerText.includes('evening') || lowerText.includes('night')) {
                extractedFilters.time = 'evening'; detectedKeywords.push('Evening/Night');
            }

            if (lowerText.includes('cheapest') || lowerText.includes('cheap') || lowerText.includes('lowest price')) {
                extractedFilters.sortBy = 'price'; detectedKeywords.push('Cheapest First');
            } else if (lowerText.includes('fastest') || lowerText.includes('quickest') || lowerText.includes('fast')) {
                extractedFilters.sortBy = 'duration'; detectedKeywords.push('Fastest First');
            } else if (lowerText.includes('earliest') || lowerText.includes('first flight')) {
                extractedFilters.sortBy = 'earliest'; detectedKeywords.push('Earliest First');
            }

            setFilters(extractedFilters);

            setMessages(prev => prev.map((m, i) =>
                (i === prev.length - 1 && m.role === 'user') ? { ...m, detectedFilters: detectedKeywords } : m
            ));

            let botContent = cleanBotContent(data.message || data.response || "");
            let results = null;
            let destinations = [];

            const extractDestinations = (rawText) => {
                if (!rawText) return [];
                const found = [];
                const blockRegex = /([A-Z][a-zA-Z\s]{1,25}?)\n([A-Z][a-zA-Z\s]{2,40}?)\n([\d]{2,4}[-–][\d]{2,4})\n([^\n]{10,200})\n([^\n]{3,50})\n([^\n]{3,50})\nBook this trip/g;
                let m;
                while ((m = blockRegex.exec(rawText)) !== null) {
                    found.push({
                        city: m[1].trim(), country: m[2].trim(), priceRange: m[3].trim(),
                        description: m[4].trim(), bestSeason: m[5].trim(), visaInfo: m[6].trim(),
                    });
                }
                if (found.length === 0) {
                    const sections = rawText.split(/Book this trip/i);
                    sections.forEach((section) => {
                        const lines = section.split('\n').map(l => l.trim()).filter(Boolean);
                        let cityLine = '', countryLine = '', priceLine = '', descLine = '';
                        for (let i = 0; i < lines.length - 2; i++) {
                            const l1 = lines[i]; const l2 = lines[i + 1]; const l3 = lines[i + 2];
                            if (l1.length > 0 && l1.length < 35 && l2.length > 0 && l2.length < 50 && /\d/.test(l3)) {
                                cityLine = l1; countryLine = l2; priceLine = l3;
                                descLine = lines.slice(i + 3).join(' '); break;
                            }
                        }
                        if (cityLine && countryLine) {
                            const seasonMatch = descLine.match(/(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[^,.]*[-–][^,.]*/i);
                            const visaMatch = descLine.match(/visa[^\n,.]*/i);
                            const cleanCity = cityLine.replace(/[^a-zA-Z\s\-]/g, '').trim();
                            found.push({
                                city: cleanCity || cityLine, country: countryLine,
                                priceRange: priceLine.replace(/[^\d\-–]/g, '').replace('–', '-'),
                                description: descLine.replace(seasonMatch?.[0] || '', '').replace(visaMatch?.[0] || '', '').trim().slice(0, 150),
                                bestSeason: seasonMatch?.[0]?.trim() || '', visaInfo: visaMatch?.[0]?.trim() || '',
                            });
                        }
                    });
                }
                return found;
            };

            if (Array.isArray(data.destinations) && data.destinations.length > 0) {
                destinations = data.destinations;
            } else {
                destinations = extractDestinations(data.message || data.response || "");
            }

            if (data.type === 'results' || data.intent === 'search' || data.offers) {
                const routeParams = data.params || {
                    from: data.origin || data.origin_iata || '',
                    to: data.destination || data.destination_iata || '',
                    date: data.departure_date || ''
                };
                results = { offers: data.offers, params: routeParams };

                if (Array.isArray(results.offers) && results.offers.length > 0) {
                    const sortedByPrice = [...results.offers].sort((a, b) => (a.totalPrice || a.price) - (b.totalPrice || b.price));
                    const sortedByDuration = [...results.offers].sort((a, b) => (a.duration || 0) - (b.duration || 0));
                    const sortedByDeparture = [...results.offers].sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));

                    results.offers = results.offers.map((o, i) => {
                        let tags = [];
                        if (o.id === sortedByPrice[0].id) tags.push('Cheapest');
                        if (o.id === sortedByDuration[0].id) tags.push('Fastest');
                        if (o.id === sortedByDeparture[0].id) tags.push('Earliest');

                        let detectedCode = o.airlineCode || o.segments?.[0]?.airlineCode;
                        if (!detectedCode) {
                            const nameMap = {
                                'emirates': 'EK', 'ethiopian': 'ET', 'flynas': 'XY', 'flydubai': 'FZ',
                                'turkish': 'TK', 'qatar': 'QR', 'saudi': 'SV', 'oman': 'WY',
                                'lufthansa': 'LH', 'british': 'BA', 'france': 'AF', 'klm': 'KL',
                                'delta': 'DL', 'american': 'AA', 'united': 'UA', 'kenya': 'KQ', 'egypt': 'MS'
                            };
                            const name = (o.airline || '').toLowerCase();
                            for (const [key, code] of Object.entries(nameMap)) {
                                if (name.includes(key)) { detectedCode = code; break; }
                            }
                        }

                        const compositeKey = `${o.airline || 'UNK'}-${o.departureTime || 'DEP'}-${o.arrivalTime || 'ARR'}-${o.price || '0'}-${i}`;
                        const hash = compositeKey.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a }, 0);
                        const uniqueId = o.uniqueId || `flt_${Math.abs(hash)}_${i}`;

                        return {
                            ...o,
                            id: uniqueId, originalId: o.id,
                            aiTags: tags,
                            airlineCode: detectedCode || 'ET',
                            flightNumber: o.flightNumber || o.segments?.[0]?.flightNumber || '600'
                        };
                    });

                    const cheapest = sortedByPrice[0].totalPrice || sortedByPrice[0].price;
                    const topOffer = results.offers[0];
                    let stopText = "nonstop";
                    let segCount = 1;
                    try {
                        const segs = typeof topOffer.segments === 'string' ? JSON.parse(topOffer.segments) : topOffer.segments;
                        if (Array.isArray(segs)) {
                            segCount = segs.length;
                            stopText = segCount === 1 ? "nonstop" : `${segCount - 1} stop${segCount > 2 ? 's' : ''}`;
                        }
                    } catch (e) { }

                    if (!botContent || botContent.length < 10) {
                        botContent = `I've found ${results.offers.length} flight options for you. The top result is a ${stopText} flight (${segCount} segment${segCount > 1 ? 's' : ''}) starting at $${cheapest}. I've summarized them below—you can click "View All Results" to see the full list.`;
                    }
                } else if (!botContent) {
                    botContent = "I couldn't find any flights matching your criteria. Would you like to try different dates or a different destination?";
                }

                setFlightResults(results);
                if (results && results.offers && results.offers.length > 0) {
                    setShowResults(true);
                }
            } else if (!botContent) {
                botContent = "I'm here to help! Let me know where you'd like to go.";
            }

            const botMsg = {
                role: 'assistant',
                content: botContent,
                animate: true,
                buttons: Array.isArray(data.buttons) ? data.buttons : [],
                action: (results && results.offers && results.offers.length > 0) ? 'view_results' : null,
                attachedResults: results,
                destinations: destinations.length > 0 ? destinations : undefined,
                type: data.type || (data.intent === 'clarify' && (
                    botContent.toLowerCase().includes('when') ||
                    botContent.toLowerCase().includes('select date')
                ) ? 'date_picker' : null)
            };

            setMessages(prev => [...prev, botMsg]);
            setChats(prev => {
                const exists = prev.some(c => c.id === activeChatId);
                if (!exists) return prev;
                return prev.map(chat => {
                    if (chat.id === activeChatId) {
                        return {
                            ...chat,
                            messages: [...chat.messages, botMsg],
                            history: [...chat.history, { role: 'assistant', content: botContent }],
                            lastResults: results || chat.lastResults
                        };
                    }
                    return chat;
                });
            });

            if (data.intent === 'chat' && data.booking_state === 'AWAITING_DESTINATION') {
                setFlightResults(null);
                setShowResults(false);
                setFilters({ sortBy: null, stops: null, airline: null, time: null });
                setHistory([]);
            }

        } catch (error) {
            console.error('Error:', error);
            setSearchProgress(null);
            setProgressPercent(0);
            const errorMsg = { role: 'assistant', content: "I'm having trouble connecting to the travel search engine. This usually happens if the backend is busy. Please try asking your question again in a moment!" };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectFlightDetail = (flight) => {
        setSelectedFlightDetails(flight);
    };

    // ── In-Chat Booking Handlers ──
    const handleStartBooking = (flight) => {
        setBookingFlight(flight);
        const botMsg = {
            role: 'assistant',
            content: `Great choice! To book your ${flight.origin} → ${flight.destination} flight with ${flight.airline} for $${flight.totalPrice || flight.price}, I'll need to verify your passport.\n\nPlease upload a photo of your passport data page — I'll extract your details automatically.`,
            type: 'passport_upload',
            flight: flight,
        };
        setMessages(prev => [...prev, botMsg]);
        setChats(prev => prev.map(chat =>
            chat.id === currentChatId
                ? { ...chat, messages: [...chat.messages, botMsg], history: [...chat.history, { role: 'assistant', content: botMsg.content }] }
                : chat
        ));
    };

    const handlePassportScanned = (passportInfo) => {
        // ── Tourism Mode: route to tour passport handler ──
        if (tourismState === 'AWAITING_PASSPORT') {
            handleTourPassportScanned(passportInfo);
            return;
        }

        // ── Flight Mode (existing) ──
        setPassengerData(passportInfo);
        setMessages(prev => prev.map(msg =>
            msg.type === 'passport_upload' && !msg.completed ? { ...msg, completed: true } : msg
        ));
        const confirmMsg = {
            role: 'assistant',
            content: `I've successfully read your passport! Here's what I found:`,
            type: 'passport_confirmed',
            passportData: passportInfo,
        };
        const paymentMsg = {
            role: 'assistant',
            content: `Now please enter your contact info and payment details below to finalize the booking.`,
            type: 'payment_form',
            flight: bookingFlight,
            passengerData: passportInfo,
        };
        setMessages(prev => [...prev, confirmMsg, paymentMsg]);
        setChats(prev => prev.map(chat =>
            chat.id === currentChatId
                ? { ...chat, messages: [...chat.messages, confirmMsg, paymentMsg], history: [...chat.history, { role: 'assistant', content: confirmMsg.content }, { role: 'assistant', content: paymentMsg.content }] }
                : chat
        ));
    };

    const handleBookingPaymentComplete = async (bookingRef, email, phone) => {
        // ── Tourism Mode: route to tour booking handler ──
        if (tourismState === 'AWAITING_PAYMENT') {
            handleTourBookingComplete(bookingRef, email, phone);
            return;
        }

        // ── Flight Mode (existing) ──
        setMessages(prev => prev.map(msg =>
            msg.type === 'payment_form' && !msg.completed ? { ...msg, completed: true } : msg
        ));

        const confirmMsg = {
            role: 'assistant',
            content: `Your booking is confirmed! Confirmation sent to ${email || 'your email'}.`,
            type: 'booking_confirmed',
            bookingRef: bookingRef,
            flight: bookingFlight,
            travelerInfo: { email, phone }
        };

        try {
            // BACKEND_URL imported from config.js
            const response = await fetch(`${BACKEND_URL}/tickets/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'ngrok-skip-browser-warning': 'true'
                },
                body: JSON.stringify({
                    email,
                    firstName: passengerData?.firstName || 'Valued',
                    lastName: passengerData?.lastName || 'Customer',
                    bookingRef,
                    flight: {
                        origin: bookingFlight?.origin,
                        destination: bookingFlight?.destination,
                        airline: bookingFlight?.airline,
                        airlineCode: bookingFlight?.airlineCode,
                        flightNumber: bookingFlight?.flightNumber,
                        totalPrice: bookingFlight?.totalPrice || bookingFlight?.price
                    }
                })
            });

            if (response.ok) {
                console.log('✉️ Ticket verification email triggered successfully');
            } else {
                const failData = await response.json();
                console.error('❌ Failed to trigger email:', failData);
            }
        } catch (err) {
            console.error('❌ Email API error:', err);
        }

        setMessages(prev => [...prev, confirmMsg]);
        setChats(prev => prev.map(chat =>
            chat.id === currentChatId
                ? { ...chat, messages: [...chat.messages, confirmMsg], history: [...chat.history, { role: 'assistant', content: confirmMsg.content }] }
                : chat
        ));
        setBookingFlight(null);
        setPassengerData(null);
    };

    const getFilteredResults = () => {
        if (!flightResults || !Array.isArray(flightResults.offers)) return [];
        let offers = [...flightResults.offers];

        if (filters.stops) {
            offers = offers.filter(o => {
                const s = o.stops ?? o.numberOfStops ?? 0;
                if (filters.stops === '0') return s === 0;
                if (filters.stops === '1') return s === 1;
                if (filters.stops === '2+') return s >= 2;
                return true;
            });
        }

        if (filters.time) {
            offers = offers.filter(o => {
                const departureDate = new Date(o.departureTime);
                const hour = departureDate.getHours();
                if (filters.time === 'morning') return hour >= 5 && hour < 12;
                if (filters.time === 'afternoon') return hour >= 12 && hour < 18;
                if (filters.time === 'evening') return hour >= 18 || hour < 5;
                return true;
            });
        }

        if (filters.sortBy === 'price') {
            offers.sort((a, b) => (a.totalPrice || a.price) - (b.totalPrice || b.price));
        } else if (filters.sortBy === 'duration') {
            offers.sort((a, b) => (a.durationMinutes || 0) - (b.durationMinutes || 0));
        } else if (filters.sortBy === 'earliest') {
            offers.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
        }

        return offers;
    };

    const filteredOffers = getFilteredResults();

    return (
        <div className="flex h-screen transition-colors duration-300 overflow-hidden font-sans">
            <Background isDark={isDark} />

            <Sidebar
                isOpen={isSidebarOpen}
                isVisible={isSidebarVisible}
                onClose={toggleSidebar}
                chats={chats}
                favorites={favorites}
                currentChatId={currentChatId}
                onNewChat={createNewChat}
                onSelectChat={(id) => { setCurrentChatId(id); setView('chat'); setIsSidebarOpen(false); }}
                onDeleteChat={deleteChat}
                onToggleFavorite={toggleFavorite}
                onSelectFavorite={(flight) => setPreviewFlight(flight)}
                onEditChat={updateChatTitle}
                onTrendingSelect={(query) => { handleStartChat(query); setIsSidebarOpen(false); }}
            />

            <div className={`flex-1 flex flex-col relative h-full transition-all duration-500 ${!isSidebarVisible ? 'w-full' : ''}`}>
                {view !== 'chat' && (
                    <div className="relative z-20 w-full max-w-5xl mx-auto px-6 py-4 flex items-center">
                        <div className="flex-1">
                            <Header
                                onClear={() => {
                                    resetAllStates();
                                    setView('home');
                                }}
                                onToggleTheme={() => setIsDark(!isDark)}
                                isDark={isDark}
                                onToggleSidebar={toggleSidebar}
                                isSidebarVisible={isSidebarVisible}
                            />
                        </div>
                    </div>
                )}

                <main className="flex-1 overflow-hidden relative z-10 w-full flex flex-col">

                    {view === 'home' && (
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                            <WelcomeBanner onStartChat={handleStartChat} onStartTourism={handleStartTourism} />
                        </div>
                    )}

                    {view === 'chat' && (
                        <div className="flex-1 flex flex-col h-full overflow-hidden bg-transparent relative">

                            {/* 1. HEADER */}
                            <header className="absolute top-0 left-0 right-0 z-30 p-2 md:p-3 pointer-events-none">
                                <div className="max-w-5xl mx-auto flex items-center justify-between px-6 py-2 bg-white/80 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 rounded-full shadow-lg shadow-black/5 dark:shadow-black/20 pointer-events-auto transition-colors duration-500">
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                if (window.innerWidth < 768) {
                                                    setIsSidebarOpen(true);
                                                } else {
                                                    setIsSidebarVisible(!isSidebarVisible);
                                                }
                                            }}
                                            className="w-9 h-9 rounded-full flex items-center justify-center text-text-primary hover:bg-white/10 transition-all group"
                                        >
                                            <Menu className={`w-4 h-4 transition-transform duration-300 ${isSidebarVisible ? 'rotate-90' : ''}`} />
                                        </button>
                                        <div className="h-4 w-px bg-white/10 mx-1" />
                                        <button
                                            onClick={createNewChat}
                                            className="w-9 h-9 rounded-full bg-secondary border border-border text-text-secondary flex items-center justify-center transition-all hover:bg-muted hover:text-accent active:scale-95"
                                            title="New Conversation"
                                        >
                                            <RotateCw className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex-1" />

                                    <div className="flex items-center gap-2 pl-4 border-l border-white/10">
                                        <button
                                            onClick={() => setIsDark(!isDark)}
                                            className="w-9 h-9 rounded-full text-text-muted hover:text-primary hover:bg-white/10 transition-all flex items-center justify-center group"
                                            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                                        >
                                            {isDark ? (
                                                <Moon className="w-4 h-4 transition-transform duration-500 group-hover:-rotate-12" />
                                            ) : (
                                                <Sun className="w-4 h-4 transition-transform duration-500 group-hover:rotate-90" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </header>

                            {/* 2. SCROLLABLE ANSWER AREA */}
                            <main className="flex-1 overflow-y-auto custom-scrollbar flex flex-col pt-20 pb-32 px-6">
                                <div className="flex-1 w-full max-w-4xl mx-auto flex flex-col gap-10">

                                    {/* Search Progress */}
                                    {searchProgress && (
                                        <div className="glass-panel p-6 rounded-3xl border border-primary/20 animate-pulse shadow-sm mb-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <span className="text-sm font-black text-primary flex items-center gap-3 uppercase tracking-tighter">
                                                    <Sparkles className="w-5 h-5 animate-spin-slow" />
                                                    {searchProgress}
                                                </span>
                                                <span className="text-xs font-black text-text-muted">{progressPercent}%</span>
                                            </div>
                                            <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-700 shadow-[0_0_15px_rgba(var(--primary-rgb),0.3)]" style={{ width: `${progressPercent}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Chat Messages */}
                                    <ChatInterface
                                        messages={messages}
                                        isTyping={isLoading}
                                        onSendMessage={handleSend}
                                        onPassportScanned={handlePassportScanned}
                                        onPaymentComplete={handleBookingPaymentComplete}
                                        favorites={favorites}
                                        onToggleFavorite={toggleFavorite}
                                        onStartBooking={handleStartBooking}
                                        onBookTour={(tour) => handleSend('📝 Book This Tour')}
                                        onTourAddOnsSelected={handleTourAddOnsSelected}
                                    />
                                </div>
                            </main>

                            {/* 3. INPUT BOX (Fixed Bottom) */}
                            <footer className="absolute bottom-0 left-0 right-0 z-30 p-4 md:p-8 pointer-events-none">
                                <div className="max-w-4xl mx-auto pointer-events-auto">
                                    <InputArea onSend={handleSend} disabled={isLoading} />
                                </div>
                            </footer>

                        </div>
                    )}

                </main>

                {/* Global Flight Preview Dialog */}
                <Dialog open={!!previewFlight} onOpenChange={() => setPreviewFlight(null)}>
                    <DialogContent className="max-w-[95vw] md:max-w-5xl h-[90dvh] p-0 bg-bg-primary border-white/10 overflow-hidden flex flex-col rounded-3xl md:rounded-[2.5rem] shadow-2xl">
                        <div className="flex-1 overflow-hidden flex flex-col relative">
                            <div className="p-4 md:p-6 pb-4 flex items-center justify-between border-b border-white/5 bg-gradient-to-r from-white/5 to-transparent">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black text-white flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center shadow-lg shadow-accent/30 animate-pulse-glow">
                                            <Sparkles className="w-5 h-5 text-accent-foreground" />
                                        </div>
                                        Saved Trip Details
                                    </DialogTitle>
                                </DialogHeader>
                            </div>
                            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                                <FlightDetails
                                    flight={previewFlight}
                                    isFavorited={previewFlight ? favorites.some(f => f.id === previewFlight.id) : false}
                                    onToggleFavorite={toggleFavorite}
                                />
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}

const X = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export default App;
