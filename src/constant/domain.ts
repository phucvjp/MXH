// export const BE_IP:string = 'localhost';
// export const BACK_END:string  = `http://${BE_IP}:8080`;
// export const WS_BACK_END: string = `ws://${BE_IP}:8080`;
// export const NG_HEADER = {}

export const BE_IP: string = "5be9-14-169-10-12";
export const BACK_END: string = `https://${BE_IP}.ngrok-free.app`;
export const WS_BACK_END: string = `wss://${BE_IP}.ngrok-free.app`;

export const NG_HEADER = {
  "Access-Control-Allow-Origin": "http://localhost:5173",
  "ngrok-skip-browser-warning": "true",
};
