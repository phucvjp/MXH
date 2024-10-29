// export const BE_IP:string = 'localhost';
// export const BACK_END:string  = `http://${BE_IP}:8080`;
// export const WS_BACK_END: string = `ws://${BE_IP}:8080`;
// export const NG_HEADER = {}

export const BE_IP: string = "aacf-2401-d800-b22-a3c7-f1b3-128a-7bb2-e1bb";
export const BACK_END: string = `https://${BE_IP}.ngrok-free.app`;
export const WS_BACK_END: string = `wss://${BE_IP}.ngrok-free.app`;

export const NG_HEADER = {
  "Access-Control-Allow-Origin": "*",
  "ngrok-skip-browser-warning": "true",
};
