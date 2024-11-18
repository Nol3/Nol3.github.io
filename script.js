document.addEventListener('DOMContentLoaded', () => {
	const gridContainer = document.querySelector('.grid-container');
	const scoreDisplay = document.getElementById('score');
	const restartBtn = document.getElementById('restart-btn');
	const lastMoveDisplay = document.getElementById('last-move');
	const moveImage = document.createElement('img');
	let bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
	document.getElementById('best-score').textContent = bestScore;
	moveImage.style.width = '30px'; // Ajusta el tamaño según necesites
	lastMoveDisplay.appendChild(moveImage);
	let tiles = [];
	let board = Array(16).fill(0);
	let score = 0;
	let touchStartX = 0;
	let touchStartY = 0;
	const SWIPE_THRESHOLD = 50; // Umbral mínimo en píxeles para detectar swipe
	let isProcessingMove = false;
	const MOVE_DELAY = 500; // Delay en ms entre movimientos permitidos

	// Añadir eventos touch al grid-container
	gridContainer.addEventListener('touchstart', handleTouchStart);
	gridContainer.addEventListener('touchmove', handleTouchMove);

	// Añadir al script.js
	document.getElementById('mobile-instructions').addEventListener('click', () => {
		document.getElementById('mobile-modal').style.display = 'block';
	});

	document.getElementById('close-modal').addEventListener('click', () => {
		document.getElementById('mobile-modal').style.display = 'none';
	});

	// Cerrar modal al hacer click fuera
	document.getElementById('mobile-modal').addEventListener('click', (e) => {
		if (e.target.id === 'mobile-modal') {
			document.getElementById('mobile-modal').style.display = 'none';
		}
	});

	function handleTouchStart(event) {
		touchStartX = event.touches[0].clientX;
		touchStartY = event.touches[0].clientY;
	}

	function handleTouchMove(event) {
		if (!touchStartX || !touchStartY || isProcessingMove) return;

		event.preventDefault();
		isProcessingMove = true; // Bloquear nuevos movimientos

		const touchEndX = event.touches[0].clientX;
		const touchEndY = event.touches[0].clientY;

		const deltaX = touchEndX - touchStartX;
		const deltaY = touchEndY - touchStartY;

		if (Math.abs(deltaX) < SWIPE_THRESHOLD && Math.abs(deltaY) < SWIPE_THRESHOLD) {
			isProcessingMove = false;
			return;
		}

		let moved = false;

		if (Math.abs(deltaX) > Math.abs(deltaY)) {
			if (deltaX > 0) {
				moved = moveRight();
				moveImage.src = './svg/derecha.svg';
			} else {
				moved = moveLeft();
				moveImage.src = './svg/izquierda.svg';
			}
		} else {
			if (deltaY > 0) {
				moved = moveDown();
				moveImage.src = './svg/abajo.svg';
			} else {
				moved = moveUp();
				moveImage.src = './svg/arriba.svg';
			}
		}

		if (moved) {
			addNewTile();
			updateDisplay();
			setTimeout(() => {
				checkGameOver();
				isProcessingMove = false;
			}, MOVE_DELAY);
		} else {
			isProcessingMove = false;
		}

		touchStartX = 0;
		touchStartY = 0;
	}

	// Inicializar el tablero
	// Modificar la función initializeBoard
	function initializeBoard() {
		// Crear tiles
		for (let i = 0; i < 16; i++) {
			const tile = document.createElement('div');
			tile.classList.add('tile');
			gridContainer.appendChild(tile);
			tiles.push(tile);
		}

		// Añadir 2 fichas iniciales de manera secuencial
		addInitialTiles();
	}

	// Nueva función para añadir las fichas iniciales
	function addInitialTiles() {
		// Añadir primera ficha
		const firstTile = Math.floor(Math.random() * 16);
		board[firstTile] = Math.random() < 0.9 ? 2 : 4;

		// Añadir segunda ficha (asegurándose de que sea en una posición diferente)
		let secondTile;
		do {
			secondTile = Math.floor(Math.random() * 16);
		} while (secondTile === firstTile);

		board[secondTile] = Math.random() < 0.9 ? 2 : 4;

		// Actualizar visualización
		updateDisplay();
	}

	// Añadir nueva ficha
	function addNewTile() {
		const emptyTiles = board.map((value, index) => ({ value, index }))
			.filter(tile => tile.value === 0);
		if (emptyTiles.length === 0) return;

		setTimeout(() => {
			const randomTile = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
			const value = Math.random() < 0.9 ? 2 : 4;
			board[randomTile.index] = value;
			updateDisplay();
		}, 150); // Delay de 150ms antes de añadir nueva ficha
	}

	// Actualizar visualización
	// Modificar updateDisplay para incluir delay en los cambios
	function updateDisplay() {
		// Primero actualizamos las posiciones existentes
		for (let i = 0; i < 16; i++) {
			if (board[i] !== 0) {
				tiles[i].textContent = board[i];
				tiles[i].className = 'tile';
				tiles[i].classList.add(`tile-${board[i]}`);
				// Añadir clase para animación de aparición
				tiles[i].classList.add('tile-new');
			} else {
				tiles[i].textContent = '';
				tiles[i].className = 'tile';
			}
		}

		// Removemos la clase de animación después de la transición
		setTimeout(() => {
			tiles.forEach(tile => {
				tile.classList.remove('tile-new');
			});
		}, 300);

		scoreDisplay.textContent = score;
		if (score > bestScore) {
			bestScore = score;
			localStorage.setItem('bestScore', bestScore);
			document.getElementById('best-score').textContent = bestScore;
		}
		if (board.includes(2048)) {
			document.getElementById('win-score').textContent = score;
			document.getElementById('win-modal').style.display = 'block';
		}
	}

	// Añadir evento para el botón de continuar
	document.getElementById('continue-game').addEventListener('click', () => {
		document.getElementById('win-modal').style.display = 'none';
	});

	// Modificar el event listener de las teclas para prevenir el scroll
	document.addEventListener('keydown', (e) => {
		if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
			e.preventDefault(); // Prevenir el scroll

			if (isProcessingMove) return;

			let moved = false;
			isProcessingMove = true;

			switch (e.key) {
				case 'ArrowLeft':
					moved = moveLeft();
					moveImage.src = './svg/izquierda.svg';
					break;
				case 'ArrowRight':
					moved = moveRight();
					moveImage.src = './svg/derecha.svg';
					break;
				case 'ArrowUp':
					moved = moveUp();
					moveImage.src = './svg/arriba.svg';
					break;
				case 'ArrowDown':
					moved = moveDown();
					moveImage.src = './svg/abajo.svg';
					break;
			}

			if (moved) {
				addNewTile();
				updateDisplay();
				setTimeout(() => {
					checkGameOver();
					isProcessingMove = false;
				}, MOVE_DELAY);
			} else {
				isProcessingMove = false;
			}
		}
	});

	// Funciones de movimiento
	function moveLeft() {
		let moved = false;
		for (let i = 0; i < 16; i += 4) {
			const row = board.slice(i, i + 4);
			const filteredRow = row.filter(num => num !== 0);

			// Combinar fichas
			for (let j = 0; j < filteredRow.length - 1; j++) {
				if (filteredRow[j] === filteredRow[j + 1]) {
					filteredRow[j] *= 2;
					score += filteredRow[j];
					filteredRow.splice(j + 1, 1);
				}
			}

			// Rellenar con ceros
			while (filteredRow.length < 4) {
				filteredRow.push(0);
			}

			// Actualizar tablero
			for (let j = 0; j < 4; j++) {
				if (board[i + j] !== filteredRow[j]) {
					moved = true;
				}
				board[i + j] = filteredRow[j];
			}
		}
		return moved;
	}

	function moveRight() {
		let moved = false;
		for (let i = 0; i < 16; i += 4) {
			const row = board.slice(i, i + 4).reverse();
			const filteredRow = row.filter(num => num !== 0);

			// Combinar fichas
			for (let j = 0; j < filteredRow.length - 1; j++) {
				if (filteredRow[j] === filteredRow[j + 1]) {
					filteredRow[j] *= 2;
					score += filteredRow[j];
					filteredRow.splice(j + 1, 1);
				}
			}

			// Rellenar con ceros
			while (filteredRow.length < 4) {
				filteredRow.push(0);
			}

			// Actualizar tablero
			const finalRow = filteredRow.reverse();
			for (let j = 0; j < 4; j++) {
				if (board[i + j] !== finalRow[j]) {
					moved = true;
				}
				board[i + j] = finalRow[j];
			}
		}
		return moved;
	}

	function moveUp() {
		let moved = false;
		for (let i = 0; i < 4; i++) {
			// Obtener columna
			const column = [
				board[i],
				board[i + 4],
				board[i + 8],
				board[i + 12]
			];

			const filteredColumn = column.filter(num => num !== 0);

			// Combinar fichas
			for (let j = 0; j < filteredColumn.length - 1; j++) {
				if (filteredColumn[j] === filteredColumn[j + 1]) {
					filteredColumn[j] *= 2;
					score += filteredColumn[j];
					filteredColumn.splice(j + 1, 1);
				}
			}

			// Rellenar con ceros
			while (filteredColumn.length < 4) {
				filteredColumn.push(0);
			}

			// Actualizar tablero
			for (let j = 0; j < 4; j++) {
				if (board[i + j * 4] !== filteredColumn[j]) {
					moved = true;
				}
				board[i + j * 4] = filteredColumn[j];
			}
		}
		return moved;
	}

	function moveDown() {
		let moved = false;
		for (let i = 0; i < 4; i++) {
			// Obtener columna
			const column = [
				board[i],
				board[i + 4],
				board[i + 8],
				board[i + 12]
			].reverse();

			const filteredColumn = column.filter(num => num !== 0);

			// Combinar fichas
			for (let j = 0; j < filteredColumn.length - 1; j++) {
				if (filteredColumn[j] === filteredColumn[j + 1]) {
					filteredColumn[j] *= 2;
					score += filteredColumn[j];
					filteredColumn.splice(j + 1, 1);
				}
			}

			// Rellenar con ceros
			while (filteredColumn.length < 4) {
				filteredColumn.push(0);
			}

			// Actualizar tablero
			const finalColumn = filteredColumn.reverse();
			for (let j = 0; j < 4; j++) {
				if (board[i + j * 4] !== finalColumn[j]) {
					moved = true;
				}
				board[i + j * 4] = finalColumn[j];
			}
		}
		return moved;
	}

	function checkGameOver() {
		// Verificar si hay espacios vacíos
		if (board.includes(0)) return false;

		// Verificar movimientos posibles horizontalmente
		for (let i = 0; i < 16; i += 4) {
			for (let j = 0; j < 3; j++) {
				if (board[i + j] === board[i + j + 1]) {
					return false;
				}
			}
		}

		// Verificar movimientos posibles verticalmente
		for (let i = 0; i < 4; i++) {
			for (let j = 0; j < 12; j += 4) {
				if (board[i + j] === board[i + j + 4]) {
					return false;
				}
			}
		}

		// Mostrar modal de Game Over
		document.getElementById('final-score').textContent = score;
		document.getElementById('gameover-modal').style.display = 'block';
		return true;
	}

	// Añadir evento para el botón de cerrar
	document.getElementById('close-gameover').addEventListener('click', () => {
		document.getElementById('gameover-modal').style.display = 'none';
		restartBtn.click(); // Reiniciar el juego automáticamente
	});

	// Modificar la función de reinicio
	restartBtn.addEventListener('click', () => {
		// Limpiar el estado del juego
		restartBtn.classList.add('rotate');
		board = Array(16).fill(0);
		score = 0;
		isProcessingMove = false;

		// Remover la clase después de que termine la animación
		setTimeout(() => {
			restartBtn.classList.remove('rotate');
		}, 500); // 500ms = duración de la animación

		// Limpiar el grid existente
		gridContainer.innerHTML = '';
		tiles = [];
		moveImage.src = '';

		// Reinicializar el tablero
		initializeBoard();
		updateDisplay();
	});
	initializeBoard();
});