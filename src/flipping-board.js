const FLAP_CHARS = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$()-+&=;:'\"%,./?°";

const BOARD_ROWS = 6;
const BOARD_COLS = 22;

const BASE_COL_DELAY = 30;
const BASE_ROW_DELAY = 20;
const BASE_STEP_MS = 55;
const BASE_FLIP_S = 0.35;

const ACCENT_COLORS = [
  { top: "var(--accent-red-top, #d32f2f)", bottom: "var(--accent-red-bot, #b71c1c)", text: "#fff" },
  { top: "var(--accent-orange-top, #f57c00)", bottom: "var(--accent-orange-bot, #e65100)", text: "#fff" },
  { top: "var(--accent-yellow-top, #fbc02d)", bottom: "var(--accent-yellow-bot, #f57f17)", text: "#171717" },
  { top: "var(--accent-green-top, #43a047)", bottom: "var(--accent-green-bot, #1b5e20)", text: "#fff" },
  { top: "var(--accent-blue-top, #1e88e5)", bottom: "var(--accent-blue-bot, #0d47a1)", text: "#fff" },
  { top: "var(--accent-violet-top, #8e24aa)", bottom: "var(--accent-violet-bot, #4a148c)", text: "#fff" },
  { top: "var(--accent-white-top, #fafafa)", bottom: "var(--accent-white-bot, #e0e0e0)", text: "#171717" },
];

const COLOR_MAP = {
  "{R}": "#D32F2F",
  "{O}": "#F57C00",
  "{Y}": "#FBC02D",
  "{G}": "#43A047",
  "{B}": "#1E88E5",
  "{V}": "#8E24AA",
  "{W}": "#FAFAFA",
};

export class TextFlippingBoard {
  constructor(container, options = {}) {
    this.container = container;
    this.text = options.text || "";
    this.duration = options.duration || 2.5; // BASE_TOTAL_S approximation

    const scale = this.duration / 2.5;
    this.colDelay = BASE_COL_DELAY * scale;
    this.rowDelay = BASE_ROW_DELAY * scale;
    this.stepMs = BASE_STEP_MS * scale;
    this.flipDurMs = Math.min(600, Math.max(150, BASE_FLIP_S * scale * 1000));

    this.grid = [];
    this.initBoard();
    this.render();
    this.startAnimation();
  }

  initBoard() {
    this.grid = Array.from({ length: BOARD_ROWS }, () =>
      Array.from({ length: BOARD_COLS }, () => ({
        type: "char",
        value: " ",
        cellInstance: null
      }))
    );

    const lines = this.wrapText(this.text, BOARD_COLS).slice(0, BOARD_ROWS);
    const startRow = Math.max(0, Math.floor((BOARD_ROWS - lines.length) / 2));
    
    lines.forEach((line, i) => {
      const row = startRow + i;
      if (row >= BOARD_ROWS) return;
      const parsed = this.parseRow(line);
      const startCol = Math.max(0, Math.floor((BOARD_COLS - parsed.length) / 2));
      parsed.forEach((cell, c) => {
        if (startCol + c < BOARD_COLS) {
          this.grid[row][startCol + c] = cell;
        }
      });
    });
  }

  wrapParagraph(paragraph, maxCols) {
    const lines = [];
    const words = paragraph.split(/[ \t]+/).filter(Boolean);
    let currentLine = "";

    for (const word of words) {
      if (word.length > maxCols) {
        if (currentLine) {
          lines.push(currentLine);
          currentLine = "";
        }
        lines.push(word.slice(0, maxCols));
        continue;
      }

      if (!currentLine) {
        currentLine = word;
      } else if (currentLine.length + 1 + word.length <= maxCols) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }

    if (currentLine) lines.push(currentLine);
    return lines;
  }

  wrapText(input, maxCols) {
    return input
      .split("\n")
      .flatMap((paragraph) =>
        paragraph.trim() === "" ? [""] : this.wrapParagraph(paragraph, maxCols)
      );
  }

  parseRow(row) {
    const cells = [];
    let i = 0;
    while (i < row.length) {
      if (row[i] === "{" && i + 2 < row.length && row[i + 2] === "}") {
        const code = row.substring(i, i + 3);
        if (COLOR_MAP[code]) {
          cells.push({ type: "color", hex: COLOR_MAP[code] });
          i += 3;
          continue;
        }
      }
      cells.push({ type: "char", value: row[i] });
      i++;
    }
    return cells;
  }

  render() {
    this.container.innerHTML = "";
    this.container.className = "flipping-board-wrapper";
    
    const gridEl = document.createElement("div");
    gridEl.className = "flipping-board-grid";
    gridEl.style.gridTemplateColumns = `repeat(${BOARD_COLS}, 1fr)`;

    this.grid.forEach((row, r) => {
      row.forEach((cellData, c) => {
        if (cellData.type === "color") {
          const colorEl = document.createElement("div");
          colorEl.className = "color-cell";
          colorEl.style.backgroundColor = cellData.hex;
          gridEl.appendChild(colorEl);
        } else {
          const cellParams = {
            target: cellData.value,
            delay: c * this.colDelay + r * this.rowDelay,
            stepMs: this.stepMs,
            flipDurMs: this.flipDurMs
          };
          const cell = new FlapCell(cellParams);
          cellData.cellInstance = cell;
          gridEl.appendChild(cell.el);
        }
      });
    });

    this.container.appendChild(gridEl);
  }

  startAnimation() {
    this.grid.forEach(row => {
      row.forEach(cellData => {
        if (cellData.cellInstance) {
          cellData.cellInstance.triggerAnimation();
        }
      });
    });
  }

  updateText(newText) {
    this.text = newText;
    const lines = this.wrapText(this.text, BOARD_COLS).slice(0, BOARD_ROWS);
    const startRow = Math.max(0, Math.floor((BOARD_ROWS - lines.length) / 2));
    
    // reset virtual grid values
    this.grid.forEach(row => row.forEach(cell => {
      if (cell.type === "char") cell.value = " ";
    }));

    lines.forEach((line, i) => {
      const row = startRow + i;
      if (row >= BOARD_ROWS) return;
      const parsed = this.parseRow(line);
      const startCol = Math.max(0, Math.floor((BOARD_COLS - parsed.length) / 2));
      parsed.forEach((cell, c) => {
        if (startCol + c < BOARD_COLS && cell.type === "char") {
          this.grid[row][startCol + c].value = cell.value;
        }
      });
    });

    this.grid.forEach(row => {
      row.forEach(cellData => {
        if (cellData.cellInstance) {
          cellData.cellInstance.setTarget(cellData.value);
        }
      });
    });
  }
}

class FlapCell {
  constructor(config) {
    this.target = config.target;
    this.delay = config.delay;
    this.stepMs = config.stepMs;
    this.flipDurMs = config.flipDurMs;

    this.normalized = FLAP_CHARS.includes(this.target.toUpperCase()) ? this.target.toUpperCase() : " ";
    this.current = " ";
    this.prev = " ";
    this.accent = null;
    this.prevAccent = null;

    this.el = document.createElement("div");
    this.el.className = "flap-cell";
    this.buildDOM();
  }

  buildDOM() {
    this.el.innerHTML = `
      <div class="flap-container transform-3d perspective-dramatic">
        <div class="flap-divider-bg">
          <div class="fd-left"></div><div class="fd-mid"></div><div class="fd-right"></div>
        </div>
        
        <div class="flap-top static-top">
          <div class="flap-text"></div>
        </div>
        
        <div class="flap-bottom static-bottom">
          <div class="flap-text"></div>
          <div class="flap-bottom-shadow"></div>
        </div>

        <div class="flap-top moving-top" style="display: none;">
          <div class="flap-text"></div>
          <div class="flap-top-shadow"></div>
        </div>

        <div class="flap-bottom moving-bottom" style="display: none;">
          <div class="flap-text"></div>
          <div class="flap-bottom-shadow-light"></div>
        </div>
        
        <div class="flap-split-line"></div>
      </div>
      <div class="flap-stripes"></div>
    `;

    this.staticTopText = this.el.querySelector('.static-top .flap-text');
    this.staticBottomText = this.el.querySelector('.static-bottom .flap-text');
    this.movingTopText = this.el.querySelector('.moving-top .flap-text');
    this.movingBottomText = this.el.querySelector('.moving-bottom .flap-text');
    
    this.staticTop = this.el.querySelector('.static-top');
    this.staticBottom = this.el.querySelector('.static-bottom');
    this.movingTop = this.el.querySelector('.moving-top');
    this.movingBottom = this.el.querySelector('.moving-bottom');
    
    this.staticBottomShadow = this.el.querySelector('.static-bottom .flap-bottom-shadow');
    this.movingTopShadow = this.el.querySelector('.moving-top .flap-top-shadow');
    this.movingBottomShadow = this.el.querySelector('.moving-bottom .flap-bottom-shadow-light');

    this.updateContent(" ", null);
  }

  updateContent(char, accent) {
    const displayChar = char === " " ? "\u00A0" : char;
    this.staticTopText.textContent = displayChar;
    this.staticBottomText.textContent = displayChar;
    this.movingTopText.textContent = this.prev === " " ? "\u00A0" : this.prev;
    this.movingBottomText.textContent = displayChar;

    // Default colors
    let topBg = "var(--flap-bg)";
    let botBg = "var(--flap-bg)";
    let txtColor = "var(--flap-text)";
    
    let prevTopBg = "var(--flap-prev-bg)";
    let prevTxtColor = "var(--flap-text)";

    if (accent) {
      topBg = accent.top;
      botBg = accent.bottom;
      txtColor = accent.text;
    }
    if (this.prevAccent) {
      prevTopBg = this.prevAccent.top;
      prevTxtColor = this.prevAccent.text;
    }

    this.staticTop.style.backgroundColor = topBg;
    this.staticTopText.style.color = txtColor;
    
    this.staticBottom.style.backgroundColor = botBg;
    this.staticBottomText.style.color = txtColor;
    
    this.movingTop.style.backgroundColor = prevTopBg;
    this.movingTopText.style.color = prevTxtColor;
    
    this.movingBottom.style.backgroundColor = botBg;
    this.movingBottomText.style.color = txtColor;
  }

  setTarget(newTarget) {
    if (this.target === newTarget) return;
    this.target = newTarget;
    this.normalized = FLAP_CHARS.includes(this.target.toUpperCase()) ? this.target.toUpperCase() : " ";
    this.triggerAnimation();
  }

  triggerAnimation() {
    if (this.normalized === " " && this.current === " ") return;

    const scrambleCount = this.normalized === " "
      ? 8 + Math.floor(Math.random() * 8)
      : 25 + Math.floor(Math.random() * 15);

    const runStep = (i) => {
      const isLast = i === scrambleCount;
      const ch = isLast ? this.normalized : FLAP_CHARS[1 + Math.floor(Math.random() * (FLAP_CHARS.length - 1))];
      const newAccent = isLast ? null : Math.random() < 0.2 ? ACCENT_COLORS[Math.floor(Math.random() * ACCENT_COLORS.length)] : null;

      this.prev = this.current;
      this.prevAccent = this.accent;
      this.current = ch;
      this.accent = newAccent;

      this.updateContent(ch, newAccent);
      this.playFlip();

      if (!isLast) {
        setTimeout(() => runStep(i + 1), this.stepMs);
      }
    };

    setTimeout(() => runStep(1), this.delay);
  }

  playFlip() {
    this.movingTop.style.display = 'block';
    this.movingBottom.style.display = 'block';

    const duration = this.flipDurMs;
    const bottomDelay = duration * 0.5;

    // Moving Top: Rotates from 0 to -100
    this.movingTop.animate([
      { transform: 'rotateX(0deg)' },
      { transform: 'rotateX(-100deg)' }
    ], {
      duration: duration,
      easing: 'cubic-bezier(0.55, 0.055, 0.675, 0.19)',
      fill: 'forwards'
    });

    // Moving Top Shadow
    this.movingTopShadow.animate([
      { opacity: 0 },
      { opacity: 0.6 }
    ], { duration: duration, fill: 'forwards' });

    // Moving Bottom: Rotates from 90 to 0
    this.movingBottom.animate([
      { transform: 'rotateX(90deg)' },
      { transform: 'rotateX(0deg)' }
    ], {
      duration: duration * 0.85,
      delay: bottomDelay,
      easing: 'cubic-bezier(0.33, 1.55, 0.64, 1)',
      fill: 'forwards'
    });

    // Moving Bottom Shadow Light
    this.movingBottomShadow.animate([
      { opacity: 0.4 },
      { opacity: 0 }
    ], {
      duration: duration * 0.85,
      delay: bottomDelay,
      fill: 'forwards'
    });

    // Static Bottom Shadow Darkening
    this.staticBottomShadow.animate([
      { opacity: 0.5 },
      { opacity: 0 }
    ], {
      duration: duration * 1.3,
      easing: 'ease-out',
      fill: 'forwards'
    });
  }
}
