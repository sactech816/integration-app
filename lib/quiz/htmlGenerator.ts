// 診断クイズのHTML生成（静的HTMLエクスポート用）
import { Quiz } from '@/lib/types';

export const generateQuizHTML = (quiz: Quiz): string => {
  const { title, description, questions, results, color, mode } = quiz;
  
  return `<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description || ''}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description || ''}">
  <meta property="og:type" content="website">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, ${color}20, ${color}10); min-height: 100vh; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .quiz-card { background: white; border-radius: 20px; padding: 30px; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
    .title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 10px; text-align: center; }
    .description { color: #6b7280; text-align: center; margin-bottom: 30px; }
    .question { font-size: 18px; font-weight: 600; color: #1f2937; margin-bottom: 20px; text-align: center; }
    .options { display: flex; flex-direction: column; gap: 12px; }
    .option { padding: 16px 20px; border: 2px solid #e5e7eb; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .option:hover { border-color: ${color}; background: ${color}10; }
    .progress { height: 6px; background: #e5e7eb; border-radius: 3px; margin-bottom: 20px; overflow: hidden; }
    .progress-bar { height: 100%; background: ${color}; transition: width 0.3s; }
    .result { text-align: center; }
    .result-title { font-size: 28px; font-weight: bold; color: ${color}; margin-bottom: 20px; }
    .result-description { color: #4b5563; line-height: 1.8; }
    .hidden { display: none; }
    .btn { display: inline-block; padding: 14px 28px; background: ${color}; color: white; font-weight: bold; border-radius: 30px; text-decoration: none; margin-top: 20px; }
    .footer { text-align: center; padding: 32px 0; }
    .footer a { color: #9ca3af; font-size: 12px; text-decoration: none; }
    .footer a:hover { color: #6b7280; }
  </style>
</head>
<body>
  <div class="container">
    <div class="quiz-card" id="start">
      <h1 class="title">${title}</h1>
      <p class="description">${description || ''}</p>
      <button class="btn" onclick="startQuiz()" style="width: 100%; border: none; cursor: pointer;">診断を始める</button>
    </div>
    
    <div class="quiz-card hidden" id="quiz">
      <div class="progress"><div class="progress-bar" id="progress"></div></div>
      <p class="question" id="question"></p>
      <div class="options" id="options"></div>
    </div>
    
    <div class="quiz-card hidden" id="result">
      <div class="result">
        <p style="color: #6b7280; margin-bottom: 10px;">あなたの診断結果は...</p>
        <h2 class="result-title" id="result-title"></h2>
        <p class="result-description" id="result-description"></p>
        <button class="btn" onclick="location.reload()">もう一度診断する</button>
      </div>
    </div>
    
    <div class="footer">
      <a href="https://www.makers.tokyo/" target="_blank" rel="noopener noreferrer">&copy; 2025 診断クイズメーカー</a>
    </div>
  </div>
  
  <script>
    const questions = ${JSON.stringify(questions)};
    const results = ${JSON.stringify(results)};
    const mode = "${mode || 'diagnosis'}";
    let current = 0;
    let answers = {};
    
    function startQuiz() {
      document.getElementById('start').classList.add('hidden');
      document.getElementById('quiz').classList.remove('hidden');
      showQuestion();
    }
    
    function showQuestion() {
      const q = questions[current];
      document.getElementById('question').textContent = q.text;
      document.getElementById('progress').style.width = ((current + 1) / questions.length * 100) + '%';
      
      const optionsEl = document.getElementById('options');
      optionsEl.innerHTML = '';
      q.options.forEach((opt, i) => {
        const div = document.createElement('div');
        div.className = 'option';
        div.textContent = opt.text;
        div.onclick = () => selectOption(q.id, opt);
        optionsEl.appendChild(div);
      });
    }
    
    function selectOption(qId, option) {
      answers[qId] = option;
      current++;
      if (current < questions.length) {
        showQuestion();
      } else {
        showResult();
      }
    }
    
    function showResult() {
      document.getElementById('quiz').classList.add('hidden');
      document.getElementById('result').classList.remove('hidden');
      
      let result;
      if (mode === 'fortune') {
        result = results[Math.floor(Math.random() * results.length)];
      } else if (mode === 'test') {
        let correct = 0;
        Object.values(answers).forEach(opt => { if (opt.score && opt.score.A === 1) correct++; });
        const ratio = correct / questions.length;
        let idx = Math.floor((1 - ratio) * results.length);
        if (ratio === 1) idx = 0;
        if (idx >= results.length) idx = results.length - 1;
        result = results[idx];
      } else {
        const scores = { A: 0, B: 0, C: 0 };
        Object.values(answers).forEach(opt => {
          if (opt.score) Object.entries(opt.score).forEach(([t, p]) => scores[t] = (scores[t] || 0) + p);
        });
        let maxType = 'A', maxScore = -1;
        Object.entries(scores).forEach(([t, s]) => { if (s > maxScore) { maxScore = s; maxType = t; } });
        result = results.find(r => r.type === maxType) || results[0];
      }
      
      document.getElementById('result-title').textContent = result.title;
      document.getElementById('result-description').textContent = result.description;
    }
  </script>
</body>
</html>`;
};
