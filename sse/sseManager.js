// SSE 연결 및 이벤트 관리를 담당하는 모듈

// SSE 연결된 클라이언트들을 저장하는 Set
const sseClients = new Set();

// SSE 연결 엔드포인트
export const handleSSEConnection = (req, res) => {
  // SSE 헤더 설정
  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Cache-Control",
  });

  // 클라이언트 연결 저장
  sseClients.add(res);
  console.log(`SSE 클라이언트 연결됨. 총 ${sseClients.size}명 연결 중`);

  // 연결 확인 메시지 전송
  res.write(
    `data: ${JSON.stringify({
      type: "connected",
      message: "SSE 연결 성공",
    })}\n\n`
  );

  // 연결 유지용 하트비트 (30초마다)
  const heartbeat = setInterval(() => {
    try {
      res.write(
        `data: ${JSON.stringify({
          type: "heartbeat",
          timestamp: new Date(),
        })}\n\n`
      );
    } catch (error) {
      clearInterval(heartbeat);
      sseClients.delete(res);
    }
  }, 30000);

  // 클라이언트 연결 종료 시 정리
  req.on("close", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
    console.log(`SSE 클라이언트 연결 해제됨. 총 ${sseClients.size}명 연결 중`);
  });

  req.on("error", () => {
    clearInterval(heartbeat);
    sseClients.delete(res);
  });
};

// 모든 클라이언트에게 이벤트 전송하는 범용 함수
export const broadcastToClients = (eventType, data) => {
  console.log("⭐️이벤트 실행");
  if (sseClients.size === 0) {
    console.log("연결된 SSE 클라이언트가 없습니다.");
    return;
  }

  // 이 객체를 프론트엔드에 전달
  const eventData = {
    type: eventType,
    data: data,
  };

  const message = `data: ${JSON.stringify(eventData)}\n\n`;

  // 연결이 끊어진 클라이언트들을 추적
  const deadClients = [];

  sseClients.forEach((client) => {
    try {
      client.write(message);
    } catch (error) {
      console.log("클라이언트 전송 실패:", error.message);
      deadClients.push(client);
    }
  });

  // 끊어진 연결 정리
  deadClients.forEach((client) => {
    sseClients.delete(client);
  });

  console.log(`${sseClients.size}명의 클라이언트에게 이벤트 전송:`, eventType);
};

// 연결된 클라이언트 수 반환
export const getConnectedClientsCount = () => {
  return sseClients.size;
};
