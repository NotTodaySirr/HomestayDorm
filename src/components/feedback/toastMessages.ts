export const returnRoomTicketToastMessages = {
  reconciliationCompleted:
    "Đã chuyển phiếu thanh toán sang trạng thái chờ kế toán xử lý.",
  customerAgreed: "Đã ghi nhận khách đồng ý với kết quả thanh toán.",
  customerDisagreed: "Đã chuyển phiếu sang nhóm cần kiểm tra lại.",
  roomUpdateCompleted: "Đã cập nhật phòng/giường thành công.",
} as const;

export const paymentSlipToastMessages = {
  calculationConfirmed: "Đã xác nhận kết quả tính toán phiếu thanh toán.",
  extraPaymentCreated: "Đã lập phiếu thanh toán thêm cho khách.",
  refundConfirmed: "Đã xác nhận hoàn tiền cọc cho khách.",
  extraPaymentReceived: "Đã xác nhận đã nhận tiền thanh toán thêm.",
} as const;
