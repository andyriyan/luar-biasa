/**
 * quiz.js
 * Logic for rendering and interacting with Quizzes
 */

const QuizManager = {
  data: null,
  currentIndex: 0,
  score: 0,
  selectedOption: null,
  isAnswered: false,
  slug: null,
  
  async init() {
    try {
      // Periksa protokol
      if (window.location.protocol === 'file:') {
        document.getElementById('question-text').textContent = "Jalankan dari local server (contoh: python -m http.server 8080).";
        return;
      }
      
      // Ambil slug materi dari URL parameter (misal: ?materi=statistika-smp)
      const urlParams = new URLSearchParams(window.location.search);
      this.slug = urlParams.get('materi');
      
      if (!this.slug) {
        document.getElementById('question-text').textContent = "Error: Tidak ada materi yang dipilih.";
        return;
      }
      
      const res = await fetch(`materi/${this.slug}/quiz.json`);
      if (!res.ok) throw new Error('Gagal memuat kuis');
      
      this.data = await res.json();
      document.getElementById('quiz-title').textContent = this.data.quizTitle || 'Kuis Interaktif';
      
      this.renderQuestion();
      this.setupEventListeners();
    } catch (e) {
      console.error(e);
      document.getElementById('question-text').textContent = "Gagal memuat pertanyaan kuis.";
    }
  },

  renderQuestion() {
    if (this.currentIndex >= this.data.questions.length) {
      this.showResult();
      return;
    }
    
    this.isAnswered = false;
    this.selectedOption = null;
    document.getElementById('btn-submit').disabled = true;
    document.getElementById('btn-submit').style.display = 'block';
    document.getElementById('btn-next').style.display = 'none';
    document.getElementById('explanation-box').classList.remove('show');
    
    const q = this.data.questions[this.currentIndex];
    
    // Update Progress
    const progress = ((this.currentIndex) / this.data.questions.length) * 100;
    document.getElementById('quiz-progress').style.width = `${progress}%`;
    document.getElementById('question-counter').textContent = `Pertanyaan ${this.currentIndex + 1} / ${this.data.questions.length}`;
    
    const questionText = document.getElementById('question-text');
    questionText.innerHTML = q.question;
    
    const optionsContainer = document.getElementById('options-container');
    let html = '';
    
    q.options.forEach((opt, idx) => {
      html += `
        <div class="option-card" data-value="${opt.replace(/"/g, '&quot;')}">
          ${opt}
        </div>
      `;
    });
    
    optionsContainer.innerHTML = html;
    
    // Setup option click
    const cards = optionsContainer.querySelectorAll('.option-card');
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        if (this.isAnswered) return;
        
        // Remove selection from all
        cards.forEach(c => c.classList.remove('selected'));
        // Add selection to clicked
        card.classList.add('selected');
        this.selectedOption = card.getAttribute('data-value');
        
        // Enable submit button
        document.getElementById('btn-submit').disabled = false;
      });
    });
    
    // Render Math in Question Area
    this.triggerKaTeX(document.getElementById('question-area'));
  },

  checkAnswer() {
    if (!this.selectedOption || this.isAnswered) return;
    this.isAnswered = true;
    
    const q = this.data.questions[this.currentIndex];
    const cards = document.querySelectorAll('.option-card');
    
    let isCorrect = false;
    
    cards.forEach(card => {
      const val = card.getAttribute('data-value');
      
      // Kasih warna yang benar
      if (val === q.answer) {
        card.classList.add('correct');
      }
      
      // Kasih warna yang salah kalau user milih yang salah
      if (val === this.selectedOption) {
        if (val === q.answer) {
          isCorrect = true;
          this.score++;
        } else {
          card.classList.add('wrong');
        }
      }
    });
    
    // Tampilkan pembahasan
    const expBox = document.getElementById('explanation-box');
    const expText = document.getElementById('explanation-text');
    expText.innerHTML = q.explanation || (isCorrect ? 'Jawaban Anda Benar!' : 'Jawaban Anda Kurang Tepat.');
    expBox.classList.add('show');
    
    // Render Math in Explanation
    this.triggerKaTeX(expBox);
    
    // Ganti tombol
    document.getElementById('btn-submit').style.display = 'none';
    document.getElementById('btn-next').style.display = 'block';
  },

  showResult() {
    document.getElementById('question-area').style.display = 'none';
    document.getElementById('quiz-nav').style.display = 'none';
    document.getElementById('quiz-progress').style.width = '100%';
    
    const resultArea = document.getElementById('result-area');
    resultArea.classList.add('show');
    
    const finalScore = Math.round((this.score / this.data.questions.length) * 100);
    document.getElementById('final-score').textContent = finalScore;
    
    // Save to storage
    if(window.Storage && this.slug) {
      // Progress 100% berarti sudah selesai kuis
      window.Storage.saveProgress(this.slug, 100);
      
      // Jika butuh menyimpan history skor khusus, bisa tambahkan di Storage.js
      let scores = JSON.parse(localStorage.getItem('esem_scores') || '{}');
      scores[this.slug] = finalScore;
      localStorage.setItem('esem_scores', JSON.stringify(scores));
    }
  },

  triggerKaTeX(element) {
    if (window.renderMathInElement) {
      window.renderMathInElement(element, {
        delimiters: [
          {left: '$$', right: '$$', display: true},
          {left: '$', right: '$', display: false}
        ],
        throwOnError: false
      });
    }
  },

  setupEventListeners() {
    document.getElementById('btn-submit').addEventListener('click', () => this.checkAnswer());
    document.getElementById('btn-next').addEventListener('click', () => {
      this.currentIndex++;
      this.renderQuestion();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const boot = () => {
    const required = document.getElementById('question-text') &&
      document.getElementById('options-container') &&
      document.getElementById('explanation-text');
    if (!required) {
      setTimeout(boot, 80);
      return;
    }
    QuizManager.init();
  };
  boot();
});
