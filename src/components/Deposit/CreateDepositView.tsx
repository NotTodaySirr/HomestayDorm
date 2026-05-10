"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  BedDouble,
  CheckCircle2,
  Loader2,
  Search,
  UserRound,
  WalletCards,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createDepositTicket } from "@/actions/deposit";

type RoomWithBeds = {
  id: string;
  name: string;
  capacity: number;
  occupancy: number;
  price: number;
  status: string;
  roomType: string;
  gender: string;
  amenities: string | null;
  beds: {
    id: string;
    position: string;
    price: number;
    status: string;
  }[];
};

type Registration = {
  id: string;
  customerName: string;
  phoneNumber: string;
  email: string | null;
  cccd: string | null;
  gender: string | null;
  rentalType: string | null;
  headcount: number | null;
  preferredArea: string | null;
  status: string;
  consultingRooms?: { id: string }[];
};

type Props = {
  rooms: RoomWithBeds[];
  registrations: Registration[];
};

const roomTypeLabels: Record<string, string> = {
  ktx: "KTX",
  studio: "Studio",
  "1pn": "1 phòng ngủ",
};

const genderLabels: Record<string, string> = {
  m: "Nam",
  f: "Nữ",
  all: "Tất cả",
};

const rentalTypeLabels: Record<string, string> = {
  nguyen_can: "Nguyên căn",
  o_ghep: "Ở ghép",
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatCurrency(value: number) {
  return `${value.toLocaleString("vi-VN")}đ`;
}

function formatArea(value: string | null) {
  if (!value) return "Chưa cập nhật";
  if (value === "binh_thanh") return "Q. Bình Thạnh";
  if (value === "q10") return "Q.10";
  if (value === "q7") return "Q.7";
  return value;
}

export const CreateDepositView: React.FC<Props> = ({ rooms, registrations }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [selectedRegId, setSelectedRegId] = useState("");
  const [selectedBedChoiceByRoom, setSelectedBedChoiceByRoom] = useState<Record<string, string>>({});
  const [selectedBedIds, setSelectedBedIds] = useState<Set<string>>(new Set());
  const [roomSearch, setRoomSearch] = useState("");

  const selectedReg = registrations.find((registration) => registration.id === selectedRegId);
  const selectedBeds = rooms.flatMap((room) =>
    room.beds
      .filter((bed) => selectedBedIds.has(bed.id))
      .map((bed) => ({ ...bed, roomName: room.name })),
  );
  const totalDeposit = selectedBeds.reduce((sum, bed) => sum + bed.price * 2, 0);

  const visibleRooms = rooms.filter((room) => {
    const query = roomSearch.trim().toLowerCase();
    if (!query) return true;

    return [
      room.name,
      room.roomType,
      room.gender,
      room.amenities ?? "",
      ...room.beds.map((bed) => bed.position),
    ].join(" ").toLowerCase().includes(query);
  });

  const handleRegistrationChange = (registrationId: string) => {
    setSelectedRegId(registrationId);
    setSelectedBedIds(new Set());
    setSelectedBedChoiceByRoom({});
  };

  const handleRoomBedChoiceChange = (roomId: string, value: string) => {
    setSelectedBedChoiceByRoom((current) => ({
      ...current,
      [roomId]: value,
    }));
  };

  const handleAddRoomSelection = (room: RoomWithBeds) => {
    const choice = selectedBedChoiceByRoom[room.id];
    if (!choice) return;

    const availableBedIds = room.beds.filter((bed) => bed.status === "AVAILABLE").map((bed) => bed.id);
    const nextBedIds = choice === "ROOM" ? availableBedIds : [choice];

    setSelectedBedIds((current) => {
      const next = new Set(current);
      nextBedIds.forEach((bedId) => next.add(bedId));
      return next;
    });
  };

  const toggleBed = (bedId: string) => {
    setSelectedBedIds((current) => {
      const next = new Set(current);
      if (next.has(bedId)) {
        next.delete(bedId);
      } else {
        next.add(bedId);
      }
      return next;
    });
  };

  const handleSubmit = () => {
    if (!selectedRegId || selectedBedIds.size === 0) return;

    startTransition(async () => {
      const formData = new FormData();
      formData.set("registrationId", selectedRegId);
      formData.set("bedIds", Array.from(selectedBedIds).join(","));

      const result = await createDepositTicket(formData);

      if (result.success) {
        router.push(result.depositId ? `/dashboard/deposits/${result.depositId}` : "/dashboard/deposits");
      } else {
        alert(result.error || "Đã có lỗi xảy ra khi tạo phiếu đặt cọc");
      }
    });
  };

  return (
    <div className="flex h-[calc(100dvh-var(--topbar-height)-24px)] min-h-0 flex-col gap-3 overflow-hidden bg-secondary p-4 font-['Segoe_UI'] text-on-surface sm:h-[calc(100dvh-var(--topbar-height)-32px)]">
      <header className="flex shrink-0 flex-col gap-3">
        <div>
          <h1 className="text-[20px] font-bold tracking-tight">Lập phiếu cọc mới</h1>
          <p className="text-[12px] text-on-surface-secondary">
            Chọn khách thuê, phòng và giường; hệ thống tính tiền cọc theo 2 tháng.
          </p>
          <Link
            href="/dashboard/deposits"
            className="mt-2 inline-flex min-h-8 items-center justify-center rounded-[5px] border border-border bg-surface px-3 py-1.5 text-[12px] font-semibold hover:bg-secondary"
          >
            Quay lại danh sách
          </Link>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(260px,45%)_minmax(0,1fr)] gap-3 overflow-hidden xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:grid-rows-1">
        <aside className="flex min-h-0 flex-col overflow-hidden rounded-[8px] border border-border bg-surface">
          <div className="shrink-0 border-b border-border bg-[#FAFBFF] px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-bold">Phiếu đặt cọc</h2>
              <span className="rounded-full bg-warning-container px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-warning">
                Mới
              </span>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            <div className="space-y-4">
              <Section title="Thông tin khách thuê" icon={UserRound}>
                <label className="block">
                  <span className="mb-1 block text-[11px] font-semibold text-on-surface-secondary">
                    Chọn phiếu đăng ký
                  </span>
                  <select
                    value={selectedRegId}
                    onChange={(event) => handleRegistrationChange(event.target.value)}
                    className="w-full rounded-[5px] border border-border bg-surface px-3 py-2 text-[13px] focus:border-primary focus:outline-none"
                  >
                    <option value="">Chọn phiếu đăng ký...</option>
                    {registrations.map((registration) => (
                      <option key={registration.id} value={registration.id}>
                        {registration.customerName} - {registration.phoneNumber}
                      </option>
                    ))}
                  </select>
                </label>

                {selectedReg ? (
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    <InfoRow label="Họ và tên" value={selectedReg.customerName} />
                    <InfoRow label="SĐT" value={selectedReg.phoneNumber} />
                    <InfoRow label="CCCD / Hộ chiếu" value={selectedReg.cccd || "Chưa cập nhật"} />
                    <InfoRow label="Email" value={selectedReg.email || "Chưa cập nhật"} />
                    <InfoRow label="Giới tính" value={selectedReg.gender ? genderLabels[selectedReg.gender] ?? selectedReg.gender : "Chưa cập nhật"} />
                    <InfoRow label="Hình thức" value={selectedReg.rentalType ? rentalTypeLabels[selectedReg.rentalType] ?? selectedReg.rentalType : "Chưa cập nhật"} />
                    <InfoRow label="Khu vực" value={formatArea(selectedReg.preferredArea)} />
                  </div>
                ) : (
                  <EmptyBox text="Chọn phiếu đăng ký để xem thông tin khách thuê." />
                )}
              </Section>

              <Section title="Danh sách vị trí" icon={BedDouble}>
                {selectedBeds.length > 0 ? (
                  <div className="space-y-2">
                    {selectedBeds.map((bed) => (
                      <div key={bed.id} className="rounded-[8px] border border-border bg-secondary p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[13px] font-semibold">P.{bed.roomName} - {bed.position}</p>
                            <p className="mt-1 text-[12px] text-on-surface-secondary">
                              Giá chốt: {formatCurrency(bed.price)} / tháng
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => toggleBed(bed.id)}
                            className="rounded-[5px] border border-border bg-surface px-2 py-1 text-[11px] font-semibold hover:bg-error-container hover:text-error"
                          >
                            Bỏ chọn
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyBox text="Chưa chọn giường nào." />
                )}
              </Section>

              <Section title="Thành tiền" icon={WalletCards}>
                <div className="space-y-3 text-[13px]">
                  <SummaryRow label="Tổng vị trí" value={`${selectedBeds.length} giường`} />
                  <SummaryRow label="Số tháng cọc" value="2 tháng" />
                  <SummaryRow label="Công thức" value="Tổng giá giường x 2" />
                  <div className="rounded-[8px] border border-primary bg-primary-container p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-on-surface-secondary">
                      Thành tiền
                    </p>
                    <p className="mt-1 text-[24px] font-bold text-primary">{formatCurrency(totalDeposit)}</p>
                  </div>
                </div>
              </Section>
            </div>
          </div>

          <div className="shrink-0 border-t border-border p-4">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isPending || !selectedRegId || selectedBedIds.size === 0}
              className={cx(
                "inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[5px] px-4 py-2 text-[13px] font-semibold text-white transition-colors",
                isPending || !selectedRegId || selectedBedIds.size === 0
                  ? "cursor-not-allowed bg-primary-light opacity-60"
                  : "bg-primary hover:bg-primary-light",
              )}
            >
              {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {isPending ? "Đang tạo phiếu..." : `Tạo phiếu cọc - ${formatCurrency(totalDeposit)}`}
            </button>
          </div>
        </aside>

        <section className="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-[8px] border border-border bg-surface">
          <div className="shrink-0 border-b border-border bg-[#FAFBFF] px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-[15px] font-bold">Phòng / Giường</h2>
                <p className="text-[12px] text-on-surface-secondary">
                  Chọn giường trong từng phòng rồi thêm vào danh sách vị trí.
                </p>
              </div>
              <label className="relative block w-full lg:w-[320px]">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-secondary" />
                <input
                  value={roomSearch}
                  onChange={(event) => setRoomSearch(event.target.value)}
                  className="w-full rounded-[5px] border border-border bg-surface py-2 pl-9 pr-3 text-[13px] focus:border-primary focus:outline-none"
                  placeholder="Tìm phòng, loại phòng, tiện ích..."
                />
              </label>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto p-4">
            {visibleRooms.length === 0 ? (
              <EmptyBox text="Không tìm thấy phòng phù hợp." />
            ) : (
              <div className="grid grid-cols-1 gap-3 2xl:grid-cols-2">
                {visibleRooms.map((room) => {
                  const availableBeds = room.beds.filter((bed) => bed.status === "AVAILABLE");
                  const selectedChoice = selectedBedChoiceByRoom[room.id] ?? "";
                  const isConsulted = selectedReg?.consultingRooms?.some((consultingRoom) => consultingRoom.id === room.id);
                  const selectedInRoomCount = room.beds.filter((bed) => selectedBedIds.has(bed.id)).length;
                  const choiceBedIds = selectedChoice === "ROOM" ? availableBeds.map((bed) => bed.id) : [selectedChoice].filter(Boolean);
                  const canAdd = choiceBedIds.some((bedId) => !selectedBedIds.has(bedId));
                  const roomDeposit = availableBeds.reduce((sum, bed) => sum + bed.price * 2, 0);

                  return (
                    <article
                      key={room.id}
                      className={cx(
                        "rounded-[10px] border bg-surface p-4 shadow-sm",
                        isConsulted ? "border-warning" : "border-border",
                        availableBeds.length === 0 && "opacity-70",
                      )}
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[16px] font-bold">P.{room.name}</h3>
                            {isConsulted ? (
                              <span className="rounded-full bg-warning-container px-2 py-1 text-[10px] font-bold text-warning">
                                Đã tư vấn
                              </span>
                            ) : null}
                            {selectedInRoomCount > 0 ? (
                              <span className="rounded-full bg-primary-container px-2 py-1 text-[10px] font-bold text-primary">
                                Đã chọn {selectedInRoomCount}
                              </span>
                            ) : null}
                          </div>
                          <p className="mt-1 text-[12px] text-on-surface-secondary">
                            {roomTypeLabels[room.roomType] ?? room.roomType} - {genderLabels[room.gender] ?? room.gender}
                          </p>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-[12px]">
                            <InfoMini label="Giá 1 giường" value={formatCurrency(room.price)} />
                            <InfoMini label="Giường trống" value={`${availableBeds.length}/${room.capacity}`} />
                          </div>
                          {room.amenities ? (
                            <p className="mt-2 text-[11px] text-on-surface-secondary">{room.amenities}</p>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <select
                          value={selectedChoice}
                          onChange={(event) => handleRoomBedChoiceChange(room.id, event.target.value)}
                          disabled={availableBeds.length === 0}
                          className="min-h-10 flex-1 rounded-[5px] border border-border bg-surface px-3 py-2 text-[13px] focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <option value="">
                            {availableBeds.length === 0 ? "Không còn giường trống" : "Chọn giường"}
                          </option>
                          {availableBeds.length > 1 ? (
                            <option value="ROOM" disabled={availableBeds.every((bed) => selectedBedIds.has(bed.id))}>
                              Thuê nguyên phòng - {formatCurrency(roomDeposit)}
                            </option>
                          ) : null}
                          {availableBeds.map((bed) => (
                            <option key={bed.id} value={bed.id} disabled={selectedBedIds.has(bed.id)}>
                              {bed.position} - {formatCurrency(bed.price)} / tháng
                            </option>
                          ))}
                        </select>

                        <button
                          type="button"
                          onClick={() => handleAddRoomSelection(room)}
                          disabled={!canAdd}
                          className={cx(
                            "inline-flex min-h-10 items-center justify-center gap-2 rounded-[5px] px-3 py-2 text-[12px] font-semibold transition-colors sm:w-[180px]",
                            canAdd
                              ? "bg-primary text-white hover:bg-primary-light"
                              : "cursor-not-allowed bg-secondary text-on-surface-secondary",
                          )}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          Thêm vào danh sách
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-border bg-surface">
      <div className="flex items-center gap-2 border-b border-border bg-[#FAFBFF] px-3 py-2">
        <Icon className="h-4 w-4 text-primary" strokeWidth={2} />
        <h3 className="text-[12px] font-bold uppercase tracking-[0.04em] text-primary">{title}</h3>
      </div>
      <div className="p-3">{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-[6px] bg-secondary px-3 py-2 text-[12px]">
      <span className="text-on-surface-secondary">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function InfoMini({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-[6px] bg-secondary px-2 py-1.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.04em] text-on-surface-secondary">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-b-0 last:pb-0">
      <span className="text-on-surface-secondary">{label}</span>
      <span className="text-right font-semibold">{value}</span>
    </div>
  );
}

function EmptyBox({ text }: { text: string }) {
  return (
    <div className="rounded-[8px] border border-dashed border-border bg-secondary px-4 py-6 text-center text-[13px] text-on-surface-secondary">
      {text}
    </div>
  );
}
