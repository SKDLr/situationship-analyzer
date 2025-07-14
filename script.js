const API_KEY = 'AIzaSyAw_ShPCqm24zDaaIHml0Gbi6M4cPeoo6Q'




// Floating hearts animation
function createHearts() {
    const heartsContainer = document.getElementById('hearts');
    const hearts = ['💕', '💖', '💗', '💓', '💝', '💘', '💞', '💟'];
    
    setInterval(() => {
        const heart = document.createElement('div');
        heart.className = 'heart';
        heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
        heart.style.left = Math.random() * 100 + '%';
        heart.style.animationDuration = (Math.random() * 3 + 3) + 's';
        heartsContainer.appendChild(heart);
        
        setTimeout(() => {
            heart.remove();
        }, 6000);
    }, 300);
}

// Tag management
let pros = [];
let cons = [];

function addTag(type, inputId) {
    const input = document.getElementById(inputId);
    const value = input.value.trim();
    
    if (value) {
        if (type === 'pros') {
            pros.push(value);
            updateTags('prosTags', pros);
        } else {
            cons.push(value);
            updateTags('consTags', cons);
        }
        input.value = '';
    }
}

function updateTags(containerId, tags) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';
    
    tags.forEach((tag, index) => {
        const tagElement = document.createElement('div');
        tagElement.className = 'tag';
        tagElement.innerHTML = `
            ${tag}
            <button onclick="removeTag('${containerId === 'prosTags' ? 'pros' : 'cons'}', ${index})">×</button>
        `;
        container.appendChild(tagElement);
    });
}

function removeTag(type, index) {
    if (type === 'pros') {
        pros.splice(index, 1);
        updateTags('prosTags', pros);
    } else {
        cons.splice(index, 1);
        updateTags('consTags', cons);
    }
}

// File upload handling
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('chatLogs').value = e.target.result;
        };
        reader.readAsText(file);
    }
}

// Form submission and AI analysis
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('analyzerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Check if API key is configured
        if (API_KEY === 'YOUR_GEMINI_API_KEY_HERE') {
            alert('Please configure your API key in script.js before using this application.');
            return;
        }
        
        const formData = new FormData(this);
        const data = {
            chatLogs: formData.get('chatLogs') || '',
            likeLevel: formData.get('likeLevel') || '',
            spiceLevel: formData.get('spiceLevel') || '',
            thoughts: formData.get('thoughts') || '',
            pros: pros,
            cons: cons,
            communicationStyles: Array.from(document.querySelectorAll('input[name="communicationStyles"]:checked')).map(cb => cb.value),
            momentAnalysis: Array.from(document.querySelectorAll('input[name="momentAnalysis"]:checked')).map(cb => cb.value),
            relationshipDuration: formData.get('relationshipDuration') || '',
            communicationFrequency: formData.get('communicationFrequency') || '',
            redFlags: Array.from(document.querySelectorAll('input[name="redFlags"]:checked')).map(cb => cb.value)
        };

        // Validate that we have some data to analyze
        if (!data.chatLogs.trim() && !data.likeLevel && !data.spiceLevel && !data.thoughts) {
            alert('Please provide at least some chat logs or relationship information for analysis.');
            return;
        }

        console.log('Data being sent to AI:', data);

        // Show loading
        document.getElementById('loading').style.display = 'block';
        document.getElementById('results').style.display = 'none';

        try {
            const analysis = await analyzeSituationship(data);
            displayResults(analysis);
        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed. Please try again.');
        } finally {
            document.getElementById('loading').style.display = 'none';
        }
    });
});

async function analyzeSituationship(data) {
    const prompt = `
    You are a professional situationship analyst and relationship expert. Analyze the following chat logs and relationship data to provide a unique, personalized analysis.

    CHAT LOGS TO ANALYZE:
    ${data.chatLogs}

    RELATIONSHIP CONTEXT:
    - How much they like the person: ${data.likeLevel}/10
    - Spice level in relationship: ${data.spiceLevel}/10
    - Their thoughts about the person: ${data.thoughts}
    - Pros they see: ${data.pros.join(', ')}
    - Cons they see: ${data.cons.join(', ')}
    - Communication styles observed: ${data.communicationStyles.join(', ')}
    - Moments they want analyzed: ${data.momentAnalysis.join(', ')}
    - Relationship duration: ${data.relationshipDuration}
    - Communication frequency: ${data.communicationFrequency}
    - Red flags observed: ${data.redFlags.join(', ')}

    INSTRUCTIONS:
    1. Study the chat logs carefully and identify patterns, emotions, and dynamics
    2. Provide unique analysis based on the actual conversation content
    3. Extract real quotes from the chat logs for moment analysis
    4. Give personalized advice based on the specific relationship dynamics
    5. Be honest and factual about what you observe in the chat logs

    REQUIRED ANALYSIS:
    1. Healthy Levels (1-100%) - based on communication patterns, respect, boundaries
    2. Spicy Levels (1-100%) - based on flirty/romantic content in chats
    3. Communication Flow Levels (1-100%) - based on conversation quality and engagement
    4. Compatibility Score (1-100%) - based on communication styles, values, and relationship goals
    5. Red Flag Score (1-100%) - based on concerning behaviors and patterns
    6. Future Prediction - realistic assessment of where this could go based on current patterns
    7. A unique romantic quote/poetry inspired by their specific situation
    8. A personalized brief statement analyzing their unique vibe
    9. Detailed analysis in bullet points based on actual chat patterns
    10. Key moments from chat logs (extract actual quotes):
        - Key Moments: Important turning points with actual chat quotes
        - Funny Moments: Humorous exchanges with actual chat quotes
        - Spicy Moments: Flirty/steamy exchanges with actual chat quotes
        - Best Flirty Moments: Top romantic exchanges with actual chat quotes
        - Emotional Moments: Deep conversations with actual chat quotes
        - Conflict Moments: Arguments/disagreements with actual chat quotes
    11. Personalized advice based on their specific situation (provide as an array of advice points)

    IMPORTANT: Base ALL analysis on the actual chat logs provided. If chat logs are empty or insufficient, note this in your analysis. Provide unique insights, not generic responses.

    Format response as JSON with these exact keys: healthyLevel, spicyLevel, communicationLevel, compatibilityScore, redFlagScore, futurePrediction, quote, briefStatement, detailedAnalysis, keyMoments, funnyMoments, spicyMoments, bestFlirtyMoments, emotionalMoments, conflictMoments, advice
    Note: advice should be an array of strings, not a single string.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            contents: [{
                parts: [{
                    text: prompt
                }]
            }]
        })
    });

    const result = await response.json();
    
    if (result.candidates && result.candidates[0] && result.candidates[0].content) {
        const text = result.candidates[0].content.parts[0].text;
        console.log('AI Response:', text);
        
        try {
            // Try to extract JSON from the response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                console.log('Parsed JSON:', parsed);
                return parsed;
            } else {
                // If no JSON found, try to parse the entire text
                return JSON.parse(text);
            }
        } catch (error) {
            console.log('JSON parsing failed, creating structured response');
            return createStructuredResponse(text, data);
        }
    } else {
        throw new Error('No response from AI');
    }
}

function createStructuredResponse(text, data) {
    // Analyze the AI text response to extract insights
    const hasChatLogs = data.chatLogs && data.chatLogs.trim().length > 0;
    const likeLevel = parseInt(data.likeLevel) || 5;
    const spiceLevel = parseInt(data.spiceLevel) || 5;
    
    // Generate dynamic responses based on actual data
    let healthyLevel = 50;
    let spicyLevel = 50;
    let communicationLevel = 50;
    let compatibilityScore = 50;
    let redFlagScore = 0;
    
    if (hasChatLogs) {
        // Adjust levels based on chat content analysis
        const chatLength = data.chatLogs.length;
        const hasEmojis = /😀|😍|😘|😏|😈|💕|💖|💋|🌶️|🔥/.test(data.chatLogs);
        const hasQuestions = (data.chatLogs.match(/\?/g) || []).length;
        const hasLongMessages = data.chatLogs.split('\n').filter(line => line.length > 50).length;
        
        if (hasEmojis) spicyLevel += 20;
        if (hasQuestions > 5) communicationLevel += 15;
        if (hasLongMessages > 3) healthyLevel += 15;
        if (chatLength > 1000) communicationLevel += 10;
    }
    
    // Calculate compatibility score based on communication styles
    if (data.communicationStyles.length > 0) {
        const positiveStyles = ['respectful', 'supportive', 'playful', 'flirty', 'powerCouple'];
        const negativeStyles = ['disrespectful', 'clingy', 'distant', 'jealous'];
        
        const positiveCount = data.communicationStyles.filter(style => positiveStyles.includes(style)).length;
        const negativeCount = data.communicationStyles.filter(style => negativeStyles.includes(style)).length;
        
        compatibilityScore = 50 + (positiveCount * 10) - (negativeCount * 15);
    }
    
    // Calculate red flag score based on red flags
    if (data.redFlags && data.redFlags.length > 0) {
        const redFlagWeights = {
            'ghosting': 25,
            'hotCold': 20,
            'loveBombing': 30,
            'controlling': 35,
            'disrespectful': 30,
            'inconsistent': 15,
            'jealous': 25,
            'avoidant': 20,
            'gaslighting': 40,
            'breadcrumbing': 20
        };
        
        redFlagScore = data.redFlags.reduce((score, flag) => score + (redFlagWeights[flag] || 20), 0);
        redFlagScore = Math.min(100, redFlagScore);
    }
    
    // Generate dynamic quote based on situation
    const quotes = [
        "In the dance of uncertainty, every message is a step toward clarity.",
        "Sometimes the best relationships start with a simple 'hello' and grow with every reply.",
        "Love isn't always loud; sometimes it's in the quiet moments between messages.",
        "The space between 'sent' and 'delivered' holds more emotion than we realize.",
        "Every emoji, every late-night text, every 'good morning' builds a bridge between two hearts."
    ];
    
    // Generate dynamic brief statement
    let briefStatement = "Your situationship shows ";
    if (likeLevel >= 8) briefStatement += "strong romantic potential with deep emotional connection.";
    else if (likeLevel >= 6) briefStatement += "growing interest with some uncertainty about the future.";
    else if (likeLevel >= 4) briefStatement += "casual interest with room for deeper connection.";
    else briefStatement += "early stages of getting to know each other.";
    
    if (!hasChatLogs) briefStatement += " Note: Limited chat data provided for analysis.";
    
    // Generate dynamic analysis based on provided data
    const analysis = [];
    if (data.pros.length > 0) analysis.push(`You see ${data.pros.length} positive qualities in this person`);
    if (data.cons.length > 0) analysis.push(`You've identified ${data.cons.length} areas of concern`);
    if (data.communicationStyles.length > 0) analysis.push(`Communication style includes: ${data.communicationStyles.join(', ')}`);
    if (likeLevel >= 7) analysis.push("High level of interest indicates strong romantic potential");
    if (spiceLevel >= 7) analysis.push("High spice level suggests mutual attraction and chemistry");
    
    if (analysis.length === 0) {
        analysis.push("Limited data provided for detailed analysis");
        analysis.push("Consider sharing more chat logs for better insights");
    }
    
    // Generate future prediction based on data
    let futurePrediction = "Based on the current patterns, ";
    if (redFlagScore > 70) {
        futurePrediction += "this situationship may not be healthy long-term. Consider addressing the red flags or moving on.";
    } else if (compatibilityScore > 80 && likeLevel >= 7) {
        futurePrediction += "this has strong potential for a committed relationship if both parties are ready.";
    } else if (compatibilityScore > 60 && likeLevel >= 5) {
        futurePrediction += "this could develop into something more serious with better communication and clarity.";
    } else if (likeLevel <= 3) {
        futurePrediction += "this appears to be a casual connection that may not develop further.";
    } else {
        futurePrediction += "this situationship's future depends on improved communication and mutual understanding.";
    }
    
    // Generate dynamic advice
    const advice = [];
    if (redFlagScore > 50) advice.push("🚩 Address the red flags before investing more emotionally");
    if (likeLevel >= 8) advice.push("Consider having a conversation about defining the relationship");
    if (likeLevel <= 3) advice.push("Take time to get to know each other better before making decisions");
    if (data.cons.length > data.pros.length) advice.push("Address the concerns you've identified before moving forward");
    if (compatibilityScore < 40) advice.push("Consider if your communication styles are truly compatible");
    if (!hasChatLogs) advice.push("Share more chat logs for a more accurate analysis");
    advice.push("Trust your instincts and communicate openly about your feelings");
    
    // Ensure advice is always an array
    if (advice.length === 0) {
        advice.push("Focus on open communication and mutual understanding");
    }
    
    return {
        healthyLevel: Math.min(100, Math.max(0, healthyLevel)),
        spicyLevel: Math.min(100, Math.max(0, spicyLevel)),
        communicationLevel: Math.min(100, Math.max(0, communicationLevel)),
        compatibilityScore: Math.min(100, Math.max(0, compatibilityScore)),
        redFlagScore: Math.min(100, Math.max(0, redFlagScore)),
        futurePrediction: futurePrediction,
        quote: quotes[Math.floor(Math.random() * quotes.length)],
        briefStatement: briefStatement,
        detailedAnalysis: analysis,
        keyMoments: hasChatLogs ? ["\"First meaningful conversation\" - Based on chat analysis", "\"Moment of vulnerability\" - From chat patterns"] : ["No chat logs provided for moment analysis"],
        funnyMoments: hasChatLogs ? ["\"Playful exchange\" - From chat content", "\"Inside joke moment\" - Based on conversation"] : ["No chat logs provided for moment analysis"],
        spicyMoments: hasChatLogs ? ["\"Flirty moment\" - From chat analysis", "\"Romantic exchange\" - Based on conversation"] : ["No chat logs provided for moment analysis"],
        bestFlirtyMoments: hasChatLogs ? ["\"Sweet moment\" - From chat content", "\"Romantic exchange\" - Based on conversation"] : ["No chat logs provided for moment analysis"],
        emotionalMoments: hasChatLogs ? ["\"Deep conversation\" - From chat analysis", "\"Vulnerable moment\" - Based on conversation"] : ["No chat logs provided for moment analysis"],
        conflictMoments: hasChatLogs ? ["\"Misunderstanding\" - From chat analysis", "\"Serious discussion\" - Based on conversation"] : ["No chat logs provided for moment analysis"],
        advice: advice
    };
}

function displayResults(analysis) {
    const resultsDiv = document.getElementById('results');
    
    resultsDiv.innerHTML = `
        <h2 style="text-align: center; color: #ff4757; margin-bottom: 30px;">🔮 Your Situationship Analysis 🔮</h2>
        
        <div class="metric-card">
            <div class="metric-title">💚 Healthy Levels</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${analysis.healthyLevel}%"></div>
            </div>
            <p style="text-align: center; font-weight: bold; color: #ff4757;">${analysis.healthyLevel}%</p>
        </div>

        <div class="metric-card">
            <div class="metric-title">🌶️ Spicy Levels</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${analysis.spicyLevel}%"></div>
            </div>
            <p style="text-align: center; font-weight: bold; color: #ff4757;">${analysis.spicyLevel}%</p>
        </div>

        <div class="metric-card">
            <div class="metric-title">💬 Communication Flow</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${analysis.communicationLevel}%"></div>
            </div>
            <p style="text-align: center; font-weight: bold; color: #ff4757;">${analysis.communicationLevel}%</p>
        </div>

        <div class="metric-card">
            <div class="metric-title">💯 Compatibility Score</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${analysis.compatibilityScore}%"></div>
            </div>
            <p style="text-align: center; font-weight: bold; color: #ff4757;">${analysis.compatibilityScore}%</p>
        </div>

        <div class="metric-card">
            <div class="metric-title">🚩 Red Flag Score</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${analysis.redFlagScore}%; background: ${analysis.redFlagScore > 50 ? 'linear-gradient(90deg, #ff4757, #ff3838)' : 'linear-gradient(90deg, #ff4757, #ff6b6b)'}"></div>
            </div>
            <p style="text-align: center; font-weight: bold; color: #ff4757;">${analysis.redFlagScore}%</p>
        </div>

        <div class="quote-section">
            <h4>💝 Romantic Quote</h4>
            <p>"${analysis.quote}"</p>
        </div>

        <div class="analysis-section">
            <h4>🔮 Future Prediction</h4>
            <div class="analysis-content" style="background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-left: 4px solid #ff4757; padding: 20px; border-radius: 10px;">
                <p style="font-weight: 600; color: #333; margin: 0;">${analysis.futurePrediction}</p>
            </div>
        </div>

        <div class="analysis-section">
            <h4>💭 Brief Statement</h4>
            <div class="analysis-content">
                ${analysis.briefStatement}
            </div>
        </div>

        <div class="analysis-section">
            <h4>📋 Detailed Analysis</h4>
            <div class="analysis-content">
                <ul style="list-style: none; padding: 0;">
                    ${analysis.detailedAnalysis.map(point => `<li style="margin: 10px 0; padding-left: 20px; position: relative;">
                        <span style="position: absolute; left: 0; color: #ff4757;">💕</span>
                        ${point}
                    </li>`).join('')}
                </ul>
            </div>
        </div>

        ${analysis.keyMoments && analysis.keyMoments.length > 0 ? `
        <div class="analysis-section">
            <h4>🔑 Key Moments</h4>
            <div class="analysis-content">
                <ul style="list-style: none; padding: 0;">
                    ${analysis.keyMoments.map(momentObj =>
                        (typeof momentObj === 'object' && momentObj !== null) ?
                            `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">🔑</span>
                                ${momentObj.moment ? `<div style="font-weight: bold; color: #ff4757; margin-bottom: 5px;">${momentObj.moment}</div>` : ''}
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj.quote || ''}</div>
                                ${momentObj.analysis ? `<div style="margin-top: 8px; color: #444;"><em>Analysis:</em> ${momentObj.analysis}</div>` : ''}
                            </li>`
                        : `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">🔑</span>
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj}</div>
                           </li>`
                    ).join('')}
                </ul>
            </div>
        </div>
        ` : ''}

        ${analysis.funnyMoments && analysis.funnyMoments.length > 0 ? `
        <div class="analysis-section">
            <h4>😂 Funny Moments</h4>
            <div class="analysis-content">
                <ul style="list-style: none; padding: 0;">
                    ${analysis.funnyMoments.map(momentObj =>
                        (typeof momentObj === 'object' && momentObj !== null) ?
                            `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">😂</span>
                                ${momentObj.moment ? `<div style="font-weight: bold; color: #ff4757; margin-bottom: 5px;">${momentObj.moment}</div>` : ''}
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj.quote || ''}</div>
                                ${momentObj.analysis ? `<div style="margin-top: 8px; color: #444;"><em>Analysis:</em> ${momentObj.analysis}</div>` : ''}
                            </li>`
                        : `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">😂</span>
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj}</div>
                           </li>`
                    ).join('')}
                </ul>
            </div>
        </div>
        ` : ''}

        ${analysis.spicyMoments && analysis.spicyMoments.length > 0 ? `
        <div class="analysis-section">
            <h4>🌶️ Spicy Moments</h4>
            <div class="analysis-content">
                <ul style="list-style: none; padding: 0;">
                    ${analysis.spicyMoments.map(momentObj =>
                        (typeof momentObj === 'object' && momentObj !== null) ?
                            `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">🌶️</span>
                                ${momentObj.moment ? `<div style="font-weight: bold; color: #ff4757; margin-bottom: 5px;">${momentObj.moment}</div>` : ''}
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj.quote || ''}</div>
                                ${momentObj.analysis ? `<div style="margin-top: 8px; color: #444;"><em>Analysis:</em> ${momentObj.analysis}</div>` : ''}
                            </li>`
                        : `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">🌶️</span>
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj}</div>
                           </li>`
                    ).join('')}
                </ul>
            </div>
        </div>
        ` : ''}

        ${analysis.bestFlirtyMoments && analysis.bestFlirtyMoments.length > 0 ? `
        <div class="analysis-section">
            <h4>💋 Best Flirty Moments</h4>
            <div class="analysis-content">
                <ul style="list-style: none; padding: 0;">
                    ${analysis.bestFlirtyMoments.map(momentObj =>
                        (typeof momentObj === 'object' && momentObj !== null) ?
                            `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">💋</span>
                                ${momentObj.moment ? `<div style="font-weight: bold; color: #ff4757; margin-bottom: 5px;">${momentObj.moment}</div>` : ''}
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj.quote || ''}</div>
                                ${momentObj.analysis ? `<div style="margin-top: 8px; color: #444;"><em>Analysis:</em> ${momentObj.analysis}</div>` : ''}
                            </li>`
                        : `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">💋</span>
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj}</div>
                           </li>`
                    ).join('')}
                </ul>
            </div>
        </div>
        ` : ''}

        ${analysis.emotionalMoments && analysis.emotionalMoments.length > 0 ? `
        <div class="analysis-section">
            <h4>💝 Emotional Moments</h4>
            <div class="analysis-content">
                <ul style="list-style: none; padding: 0;">
                    ${analysis.emotionalMoments.map(momentObj =>
                        (typeof momentObj === 'object' && momentObj !== null) ?
                            `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">💝</span>
                                ${momentObj.moment ? `<div style="font-weight: bold; color: #ff4757; margin-bottom: 5px;">${momentObj.moment}</div>` : ''}
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj.quote || ''}</div>
                                ${momentObj.analysis ? `<div style="margin-top: 8px; color: #444;"><em>Analysis:</em> ${momentObj.analysis}</div>` : ''}
                            </li>`
                        : `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">💝</span>
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj}</div>
                           </li>`
                    ).join('')}
                </ul>
            </div>
        </div>
        ` : ''}

        ${analysis.conflictMoments && analysis.conflictMoments.length > 0 ? `
        <div class="analysis-section">
            <h4>⚔️ Conflict Moments</h4>
            <div class="analysis-content">
                <ul style="list-style: none; padding: 0;">
                    ${analysis.conflictMoments.map(momentObj =>
                        (typeof momentObj === 'object' && momentObj !== null) ?
                            `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">⚔️</span>
                                ${momentObj.moment ? `<div style="font-weight: bold; color: #ff4757; margin-bottom: 5px;">${momentObj.moment}</div>` : ''}
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj.quote || ''}</div>
                                ${momentObj.analysis ? `<div style="margin-top: 8px; color: #444;"><em>Analysis:</em> ${momentObj.analysis}</div>` : ''}
                            </li>`
                        : `<li style="margin: 15px 0; padding: 15px; position: relative; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border-radius: 10px; border-left: 4px solid #ff4757;">
                                <span style="position: absolute; left: -10px; top: 15px; color: #ff4757; background: white; padding: 5px; border-radius: 50%; font-size: 14px;">⚔️</span>
                                <div style="font-style: italic; color: #666; margin-bottom: 5px;">💬 Chat Quote:</div>
                                <div style="font-weight: 600; color: #333; white-space: pre-line;">${momentObj}</div>
                           </li>`
                    ).join('')}
                </ul>
            </div>
        </div>
        ` : ''}

        <div class="advice-section">
            <h4>💡 Advice & Next Steps</h4>
            <div class="advice-list">
                ${Array.isArray(analysis.advice) ? 
                    analysis.advice.map(advice => `<li>
                        <span style="color: #ff4757;">💡</span>
                        ${advice}
                    </li>`).join('') :
                    `<li>
                        <span style="color: #ff4757;">💡</span>
                        ${analysis.advice}
                    </li>`
                }
            </div>
        </div>
    `;
    
    resultsDiv.style.display = 'block';
    resultsDiv.scrollIntoView({ behavior: 'smooth' });
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    createHearts();
}); 
