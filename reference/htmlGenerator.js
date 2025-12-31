export const generateQuizHTML = (quiz) => {
    // データを安全に埋め込むための処理
    const safeJson = (data) => JSON.stringify(data).replace(/</g, '\\u003c');
    const jsonQuiz = safeJson(quiz);
    const questions = typeof quiz.questions === 'string' ? JSON.parse(quiz.questions) : quiz.questions;
    const results = typeof quiz.results === 'string' ? JSON.parse(quiz.results) : quiz.results;
    
    // テーマカラーの決定
    const colorMap = {
        'bg-indigo-600': '#4f46e5', 'bg-pink-500': '#ec4899', 'bg-blue-500': '#3b82f6',
        'bg-green-500': '#22c55e', 'bg-orange-500': '#f97316', 'bg-gray-800': '#1f2937'
    };
    const mainColor = colorMap[quiz.color] || '#4f46e5';

    return `<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${quiz.title}</title>
    <meta name="description" content="${quiz.description}">
    <style>
        /* Base Reset */
        * { box-sizing: border-box; -webkit-tap-highlight-color: transparent; }
        body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background: #f3f4f6; color: #1f2937; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        
        /* Container */
        .app-container { width: 100%; max-width: 480px; background: white; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1); position: relative; min-height: 500px; display: flex; flex-direction: column; }
        
        /* Header / Hero */
        .hero { background: ${mainColor}; color: white; padding: 40px 20px; text-align: center; position: relative; overflow: hidden; transition: height 0.3s ease; }
        .hero.shrink { padding: 20px; }
        .hero-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.1; background-image: radial-gradient(circle, #ffffff 1px, transparent 1px); background-size: 20px 20px; }
        .hero-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.3; mix-blend-mode: overlay; }
        .title { font-size: 22px; font-weight: 800; position: relative; z-index: 10; margin: 0; line-height: 1.4; text-shadow: 0 2px 4px rgba(0,0,0,0.2); }
        
        /* Content Area */
        .content { padding: 24px; flex-grow: 1; display: flex; flex-direction: column; }
        .fade-in { animation: fadeIn 0.5s ease-out forwards; }
        
        /* Start Screen */
        .desc { font-size: 15px; line-height: 1.6; color: #4b5563; margin-bottom: 30px; white-space: pre-wrap; }
        
        /* Buttons */
        .btn { display: block; width: 100%; border: none; padding: 16px; border-radius: 16px; font-size: 16px; font-weight: bold; cursor: pointer; transition: all 0.2s; margin-bottom: 12px; text-align: center; text-decoration: none; }
        .btn-primary { background: ${mainColor}; color: white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        .btn-primary:active { transform: scale(0.98); opacity: 0.9; }
        
        .btn-option { background: white; border: 2px solid #e5e7eb; color: #374151; text-align: left; position: relative; }
        .btn-option:hover { border-color: ${mainColor}; background: #f9fafb; }
        .btn-option:active { transform: scale(0.98); }
        .btn-option::after { content: '›'; position: absolute; right: 20px; color: #9ca3af; font-size: 20px; }

        /* Progress Bar */
        .progress-container { background: #e5e7eb; height: 6px; border-radius: 3px; margin-bottom: 24px; overflow: hidden; }
        .progress-bar { height: 100%; background: ${mainColor}; width: 0%; transition: width 0.3s ease; }
        
        /* Question */
        .q-text { font-size: 18px; font-weight: bold; margin-bottom: 24px; line-height: 1.5; }
        .q-num { font-size: 12px; font-weight: bold; color: ${mainColor}; margin-bottom: 8px; display: block; }

        /* Result */
        .result-badge { display: inline-block; background: #f3f4f6; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; color: #4b5563; margin-bottom: 10px; }
        .result-title { font-size: 24px; font-weight: 800; color: ${mainColor}; margin-bottom: 16px; }
        .result-desc { font-size: 15px; line-height: 1.8; color: #374151; margin-bottom: 30px; background: #f9fafb; padding: 20px; border-radius: 12px; text-align: left; }
        
        /* Links */
        .link-btn { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 12px; color: white !important; }
        .link-web { background: linear-gradient(135deg, #f97316, #ea580c); }
        .link-line { background: #06c755; }
        .link-other { background: #1f2937; }

        /* Footer */
        .footer { text-align: center; font-size: 11px; color: #9ca3af; margin-top: auto; padding-top: 20px; border-top: 1px solid #f3f4f6; }
        .footer a { color: inherit; text-decoration: none; transition: opacity 0.2s; }
        .footer a:hover { opacity: 0.7; }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .hidden { display: none; }
    </style>
</head>
<body>
    <div class="app-container">
        <div id="hero" class="hero">
            <div class="hero-bg"></div>
            ${quiz.image_url ? `<img src="${quiz.image_url}" class="hero-img">` : ''}
            <h1 class="title">${quiz.title}</h1>
        </div>

        <div id="app" class="content">
            <div id="view-start" class="fade-in">
                <div class="desc">${quiz.description}</div>
                <button class="btn btn-primary" onclick="startQuiz()">診断を始める</button>
            </div>

            <div id="view-question" class="hidden">
                <div class="progress-container"><div id="progress" class="progress-bar"></div></div>
                <span class="q-num" id="q-num">Q1</span>
                <div class="q-text" id="q-text"></div>
                <div id="options-container"></div>
            </div>

            <div id="view-result" class="hidden" style="text-align: center;">
                <div class="result-badge">診断結果</div>
                <div class="result-title" id="r-title"></div>
                <div class="result-desc" id="r-desc"></div>
                <div id="r-links"></div>
                <button class="btn btn-option" onclick="location.reload()" style="margin-top:20px; text-align:center;">↻ もう一度診断する</button>
            </div>
        </div>
        <div class="footer">
            <a href="https://shindan-quiz.makers.tokyo/" target="_blank" rel="noopener noreferrer">
                &copy; Shindan Quiz Maker
            </a>
        </div>
    </div>

    <script>
        const quizData = ${jsonQuiz};
        const questions = ${safeJson(questions)};
        const results = ${safeJson(results)};
        
        let currentStep = 0;
        let scores = {A:0, B:0, C:0, D:0, E:0, F:0, G:0, H:0, I:0, J:0}; 
        let correctCount = 0;

        function startQuiz() {
            document.getElementById('view-start').classList.add('hidden');
            document.getElementById('view-question').classList.remove('hidden');
            document.getElementById('view-question').classList.add('fade-in');
            document.getElementById('hero').classList.add('shrink');
            renderQuestion();
        }

        function renderQuestion() {
            if(currentStep >= questions.length) return renderResult();
            
            const q = questions[currentStep];
            document.getElementById('q-num').innerText = 'Q' + (currentStep + 1) + ' / ' + questions.length;
            document.getElementById('q-text').innerText = q.text;
            
            // Progress Bar
            const pct = ((currentStep + 1) / questions.length) * 100;
            document.getElementById('progress').style.width = pct + '%';

            // Options
            const container = document.getElementById('options-container');
            container.innerHTML = '';
            
            // Shuffle options logic (optional)
            const options = [...q.options];
            
            options.forEach((opt, idx) => {
                const btn = document.createElement('button');
                btn.className = 'btn btn-option';
                btn.innerText = opt.label;
                btn.onclick = () => handleAnswer(opt);
                container.appendChild(btn);
            });
        }

        function handleAnswer(opt) {
            if(opt.score) {
                // テストモードの正解判定
                if(quizData.mode === 'test' && parseInt(opt.score.A) === 1) correctCount++;
                
                // スコア加算
                for (let key in opt.score) {
                    scores[key] = (scores[key] || 0) + (parseInt(opt.score[key]) || 0);
                }
            }
            currentStep++;
            
            // Fade effect for next question
            const viewQ = document.getElementById('view-question');
            viewQ.classList.remove('fade-in');
            void viewQ.offsetWidth; // trigger reflow
            viewQ.classList.add('fade-in');
            
            renderQuestion();
        }

        function renderResult() {
            document.getElementById('view-question').classList.add('hidden');
            document.getElementById('view-result').classList.remove('hidden');
            document.getElementById('view-result').classList.add('fade-in');
            document.getElementById('hero').classList.remove('shrink'); // Show hero again

            let result;
            if(quizData.mode === 'test') {
                const ratio = correctCount / questions.length;
                // 動的ランク判定
                let idx = Math.floor((1 - ratio) * results.length);
                if(ratio === 1) idx = 0;
                if(idx >= results.length) idx = results.length - 1;
                result = results[idx] || results[0];
                // スコア表示追加
                document.getElementById('r-title').innerHTML = '<div style="font-size:16px; color:#666; margin-bottom:5px;">正解率 ' + Math.round(ratio*100) + '%</div>' + result.title;
            } else if(quizData.mode === 'fortune') {
                result = results[Math.floor(Math.random() * results.length)];
                document.getElementById('r-title').innerText = result.title;
            } else {
                let maxType = 'A', maxScore = -1;
                for(let k in scores) { if(scores[k] > maxScore) { maxScore = scores[k]; maxType = k; } }
                result = results.find(r => r.type === maxType) || results[0];
                document.getElementById('r-title').innerText = result.title;
            }
            
            document.getElementById('r-desc').innerText = result.description;

            // Render Links
            const linksContainer = document.getElementById('r-links');
            let linksHtml = '';
            if(result.link_url) linksHtml += '<a href="' + result.link_url + '" target="_blank" class="btn btn-primary link-web">' + (result.link_text || '詳しく見る') + '</a>';
            if(result.line_url) linksHtml += '<a href="' + result.line_url + '" target="_blank" class="btn btn-primary link-line">' + (result.line_text || 'LINEで相談') + '</a>';
            linksContainer.innerHTML = linksHtml;
        }
    </script>
</body>
</html>`;
};