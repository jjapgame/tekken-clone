const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 400;

// 플레이어 이미지 로드
const player1Imgs = {
    idle: new Image(),
    move: new Image(),
    jump: new Image(),
    attack: new Image()
};

const player2Imgs = {
    idle: new Image(),
    move: new Image(),
    jump: new Image(),
    attack: new Image()
};

// 이미지 경로 설정
player1Imgs.idle.src = "img/player1_idle.png";
player1Imgs.move.src = "img/player1_move.png";
player1Imgs.jump.src = "img/player1_jump.png";
player1Imgs.attack.src = "img/player1_attack.png";

player2Imgs.idle.src = "img/player2_idle.png";
player2Imgs.move.src = "img/player2_move.png";
player2Imgs.jump.src = "img/player2_jump.png";
player2Imgs.attack.src = "img/player2_attack.png";

const player1 = { x: 100, y: 250, width: 50, height: 100, color: "red", hp: 100, velocityY: 0, isJumping: false, isAttacking: false, sprite: player1Imgs.idle };
const player2 = { x: 600, y: 250, width: 50, height: 100, color: "blue", hp: 100, velocityY: 0, isJumping: false, isAttacking: false, sprite: player2Imgs.idle };

let keys = {};
let gameOver = false;
let winner = "";
let attackEffect = null; // 공격 애니메이션 효과 저장

window.addEventListener("keydown", (e) => keys[e.key] = true);
window.addEventListener("keyup", (e) => keys[e.key] = false);

// 게임 재시작
function resetGame() {
    player1.x = 100;
    player1.y = 250;
    player1.hp = 100;
    player2.x = 600;
    player2.y = 250;
    player2.hp = 100;
    player1.velocityY = 0;
    player2.velocityY = 0;
    gameOver = false;
    winner = "";
    attackEffect = null;
    gameLoop();
}

// 점프 처리
function handleJump(player) {
    if (!player.isJumping) {
        player.isJumping = true;
        player.velocityY = -15; // 점프 속도
        player.sprite = player === player1 ? player1Imgs.jump : player2Imgs.jump;
    }
}

// 점프 물리 처리
function updateJump(player) {
    if (player.isJumping) {
        player.velocityY += 1; // 중력
        player.y += player.velocityY;

        if (player.y >= 250) { // 바닥에 닿으면
            player.y = 250;
            player.isJumping = false;
            player.velocityY = 0;
            player.sprite = player === player1 ? player1Imgs.idle : player2Imgs.idle; // 기본 상태로 돌아감
        }
    }
}

// 공격 처리
function handleAttack(player) {
    if (!player.isAttacking) {
        player.isAttacking = true;
        player.sprite = player === player1 ? player1Imgs.attack : player2Imgs.attack;

        setTimeout(() => {
            player.isAttacking = false;
            player.sprite = player === player1 ? player1Imgs.idle : player2Imgs.idle; // 공격 후 기본 상태로 돌아감
        }, 300); // 공격 애니메이션 지속 시간
    }
}

// 공격 이펙트 그리기
function drawAttackEffect() {
    if (attackEffect) {
        ctx.fillStyle = "yellow";
        ctx.beginPath();
        ctx.arc(attackEffect.x, attackEffect.y, 15, 0, Math.PI * 2);
        ctx.fill();
        attackEffect = null; // 한 번만 표시
    }
}

function update() {
    if (gameOver) return;

    // 이동 로직
    if (keys["ArrowLeft"]) player1.x -= 5;
    if (keys["ArrowRight"]) player1.x += 5;
    if (keys["a"]) player2.x -= 5;
    if (keys["d"]) player2.x += 5;

    // 점프
    if (keys["ArrowUp"]) handleJump(player1);
    if (keys["w"]) handleJump(player2);

    // 공격
    if (keys[" "]) { // 플레이어1 공격 (스페이스바)
        if (Math.abs(player1.x - player2.x) < 60) {
            player2.hp -= 2;
            attackEffect = { x: player2.x, y: player2.y + 50 }; // 공격 이펙트 위치 설정
        }
        handleAttack(player1);
    }

    if (keys["Shift"]) { // 플레이어2 공격 (Shift)
        if (Math.abs(player2.x - player1.x) < 60) {
            player1.hp -= 2;
            attackEffect = { x: player1.x, y: player1.y + 50 }; // 공격 이펙트 위치 설정
        }
        handleAttack(player2);
    }

    // 점프 물리
    updateJump(player1);
    updateJump(player2);

    // 게임 오버 체크
    if (player1.hp <= 0) {
        gameOver = true;
        winner = "파란색 플레이어 승리!";
    } else if (player2.hp <= 0) {
        gameOver = true;
        winner = "빨간색 플레이어 승리!";
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 플레이어 이미지 그리기
    ctx.drawImage(player1.sprite, player1.x, player1.y, player1.width, player1.height);
    ctx.drawImage(player2.sprite, player2.x, player2.y, player2.width, player2.height);

    // 체력 표시
    ctx.fillStyle = "red";
    ctx.fillRect(20, 20, player1.hp * 2, 10);

    ctx.fillStyle = "blue";
    ctx.fillRect(580, 20, player2.hp * 2, 10);

    // 공격 애니메이션 효과
    drawAttackEffect();

    // 게임 오버 메시지
    if (gameOver) {
        ctx.fillStyle = "white";
        ctx.font = "40px Arial";
        ctx.fillText("게임 오버!", canvas.width / 2 - 100, canvas.height / 2 - 50);
        ctx.fillText(winner, canvas.width / 2 - 150, canvas.height / 2);

        // 재시작 버튼
        ctx.fillStyle = "yellow";
        ctx.fillRect(canvas.width / 2 - 75, canvas.height / 2 + 30, 150, 50);
        ctx.fillStyle = "black";
        ctx.font = "20px Arial";
        ctx.fillText("다시 시작", canvas.width / 2 - 40, canvas.height / 2 + 60);
    }
}

// 마우스로 재시작 버튼 클릭 가능
canvas.addEventListener("click", (e) => {
    if (gameOver) {
        let rect = canvas.getBoundingClientRect();
        let x = e.clientX - rect.left;
        let y = e.clientY - rect.top;

        if (x > canvas.width / 2 - 75 && x < canvas.width / 2 + 75 &&
            y > canvas.height / 2 + 30 && y < canvas.height / 2 + 80) {
            resetGame();
        }
    }
});

function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

gameLoop();
