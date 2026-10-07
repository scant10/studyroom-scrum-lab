import { createApp } from "./app.ts";

const port = Number(process.env.PORT ?? 3000);
createApp().listen(port, () => {
  console.log(`스터디룸 예약 서비스: http://localhost:${port}`);
});
