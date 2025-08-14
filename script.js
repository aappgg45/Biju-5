const chatMessages = document.getElementById('chat-messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
let chatbotData;

// دالة لجلب البيانات من ملف JSON
async function fetchChatbotData() {
    try {
        const response = await fetch('data.json');
        if (!response.ok) {
            throw new Error('فشل في جلب ملف البيانات.');
        }
        chatbotData = await response.json();
        console.log('تم تحميل بيانات الروبوت بنجاح.');
    } catch (error) {
        console.error('حدث خطأ:', error);
        alert('حدث خطأ في تحميل بيانات الروبوت. يرجى التأكد من وجود ملف data.json.');
    }
}

// دالة لإضافة رسالة إلى الواجهة
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message');
    messageDiv.classList.add(sender === 'user' ? 'user-message' : 'bot-message');
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// دالة لمعالجة المدخلات وإيجاد الرد المناسب باستخدام خوارزمية التطابق
function processUserInput(input) {
    // 1. تنظيف المدخلات: تحويلها إلى حروف صغيرة وإزالة الفواصل
    const processedInput = input.toLowerCase().split(/\s+/).join(' ');

    let bestMatchScore = 0;
    let bestResponse = null;

    // 2. تكرار على كل المحادثات في ملف البيانات
    for (const conversation of chatbotData.conversations) {
        let matchScore = 0;
        
        // 3. حساب نقاط التطابق: كل كلمة مفتاحية موجودة في كلام المستخدم تزيد النتيجة
        for (const keyword of conversation.keywords) {
            if (processedInput.includes(keyword)) {
                matchScore++;
            }
        }
        
        // 4. اختيار أفضل تطابق
        if (matchScore > bestMatchScore) {
            bestMatchScore = matchScore;
            bestResponse = conversation.responses;
        }
    }

    // 5. إذا لم يتم العثور على أي تطابق، يتم استخدام الرد الافتراضي
    if (bestMatchScore === 0 || bestResponse === null) {
        const randomIndex = Math.floor(Math.random() * chatbotData.default_response.length);
        return chatbotData.default_response[randomIndex];
    } else {
        // 6. اختيار رد عشوائي من أفضل مجموعة تطابق
        const randomIndex = Math.floor(Math.random() * bestResponse.length);
        return bestResponse[randomIndex];
    }
}

// دالة إرسال الرسالة
function sendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

    addMessage(userText, 'user');
    userInput.value = '';

    setTimeout(() => {
        const botResponse = processUserInput(userText);
        addMessage(botResponse, 'bot');
    }, 500); // تأخير لمحاكاة التفكير
}

// الأحداث: إرسال الرسالة عند الضغط على الزر أو Enter
sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// عند تحميل الصفحة، يتم جلب البيانات
fetchChatbotData();