
"use client";

import { useEffect, useState } from "react";
import { toPng } from "html-to-image";
import jsPDF from "jspdf";
import {
  Plus,
  Trash2,
  Download,
  FileImage,
  FileText,
  Hotel,
  Car,
  User,
  Settings2,
  Eye,
  ChevronDown,
} from "lucide-react";

type HotelLine = {
  id: number;
  hotel: string;
  room: string;
  rooms: number;
  nights: number;
  rate: number;
  taxNote: string;
};

type CabLine = {
  id: number;
  supplier: string;
  vehicle: string;
  routes: string[];
  mode: "route" | "day" | "km" | "night" | "driver";
  quantity: number;
  days: number;
  km: number;
};

type ExtraLine = {
  id: number;
  name: string;
  quantity: number;
  rate: number;
};

type ItineraryLine = {
  id: number;
  day: string;
  title: string;
  description: string;
};

const destinations = [
  "Airport",
  "Jasidih",
  "Basukinath",
  "Sightseeing",
  "Tarapith",
  "Sultanganj",
  "Bhagalpur",
];

const hotelRates: Record<
  string,
  { room: string; cost: number; sell: number; note: string }[]
> = {
  "Hotel Lakhdataar": [
    { room: "Deluxe", cost: 1600, sell: 1920, note: "Tax not stated in rate card" },
    { room: "Premium", cost: 2000, sell: 2400, note: "Tax not stated in rate card" },
    { room: "Family", cost: 2000, sell: 2400, note: "Tax not stated in rate card" },
    { room: "Business Class", cost: 2500, sell: 3000, note: "Tax not stated in rate card" },
    { room: "Extra Bed", cost: 300, sell: 360, note: "Tax not stated in rate card" },
  ],
  "Hotel Godwin": [
    { room: "Deluxe", cost: 2400, sell: 2880, note: "Applicable tax extra" },
    { room: "Premium", cost: 3000, sell: 3600, note: "Applicable tax extra" },
    { room: "Business Class", cost: 3500, sell: 4200, note: "Applicable tax extra" },
    { room: "Family", cost: 3500, sell: 4200, note: "Applicable tax extra" },
    { room: "Extra Bed", cost: 700, sell: 840, note: "Applicable tax extra" },
  ],
  "Imperial Heights": [
    { room: "Deluxe", cost: 3500, sell: 4200, note: "Applicable tax extra" },
    { room: "Premium", cost: 4500, sell: 5400, note: "Applicable tax extra" },
    { room: "Suite", cost: 5500, sell: 6600, note: "Applicable tax extra" },
    { room: "Extra Person", cost: 800, sell: 960, note: "Applicable tax extra" },
  ],
  "Marine Blu": [
    { room: "Deluxe", cost: 3100, sell: 3720, note: "5% GST as per rate card" },
    { room: "Premium", cost: 4500, sell: 5400, note: "5% GST as per rate card" },
    { room: "Executive", cost: 5000, sell: 6000, note: "5% GST as per rate card" },
    { room: "Extra Bed", cost: 1000, sell: 1200, note: "5% GST as per rate card" },
  ],
};

const cabRates: Record<
  string,
  {
    vehicles: {
      name: string;
      routes: number[];
      day: number;
      km: number;
      night: number;
      driver: number;
    }[];
  }
> = {
  "Raghav Yadav": {
    vehicles: [
      { name: "Innova", routes: [1000, 800, 2500, 3200, 5200, 5000, 5200], day: 3000, km: 21.6, night: 1200, driver: 360 },
      { name: "Innova Crysta", routes: [1200, 1000, 3000, 3600, 6000, 5700, 5800], day: 3600, km: 25.2, night: 1800, driver: 360 },
      { name: "Ertiga", routes: [900, 700, 2200, 3000, 4800, 4500, 4500], day: 2280, km: 20.4, night: 1200, driver: 360 },
      { name: "Dzire", routes: [800, 600, 1650, 2200, 3800, 3600, 3600], day: 1440, km: 15.6, night: 960, driver: 360 },
      { name: "Winger", routes: [1500, 1300, 3500, 4500, 7500, 6500, 6500], day: 4200, km: 33.6, night: 2400, driver: 360 },
    ],
  },
  "Uday Roy": {
    vehicles: [
      { name: "Hatchback", routes: [600, 600, 1600, 2000, 3600, 3200, 3200], day: 0, km: 13.2, night: 0, driver: 0 },
      { name: "Sedan", routes: [600, 600, 1700, 2000, 3800, 3400, 3500], day: 0, km: 14.4, night: 0, driver: 0 },
      { name: "Small SUV", routes: [700, 700, 2000, 2200, 4000, 3600, 3600], day: 0, km: 16.8, night: 0, driver: 0 },
      { name: "Mid-size SUV", routes: [800, 800, 2200, 2400, 4500, 4000, 4000], day: 0, km: 18, night: 0, driver: 0 },
      { name: "Large SUV", routes: [1200, 1200, 3000, 3500, 5500, 5000, 5000], day: 0, km: 24, night: 0, driver: 0 },
    ],
  },
};

const pujaRates = [
  { name: "Sankalp Puja", cost: 551, sell: 1299 },
  { name: "Panchopchar Puja", cost: 1100, sell: 1799 },
  { name: "Shodashopchar Puja", cost: 0, sell: 2499 },
  { name: "Rudrabhishek – Basic", cost: 2100, sell: 3599 },
  { name: "Rudrabhishek – Standard", cost: 3500, sell: 5899 },
  { name: "Rudrabhishek – Premium", cost: 5500, sell: 12699 },
  { name: "Vivah Puja", cost: 5100, sell: 12699 },
];

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const newId = () => Date.now() + Math.floor(Math.random() * 100000);

export default function Home() {
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    adults: 2,
    children: 0,
    arrival: "",
    departure: "",
    pickup: "Deoghar",
    notes: "",
  });

  // Stable initial values prevent server/client hydration mismatch.
  const [quote, setQuote] = useState({
    number: "TQ-000000",
    date: "",
    valid: "3 days",
    discount: 0,
    paid: 0,
    paymentMode: "Bank Transfer / UPI",
    paymentNote: "Advance payment is required to confirm the booking.",
    terms:
      "Rates are subject to availability at the time of confirmation. Any additional services not mentioned in this quotation will be charged separately.",
  });

  // Generate date and quotation number only after the browser mounts.
  useEffect(() => {
    const now = new Date();

    setQuote((previous) => ({
      ...previous,
      number: `TQ-${Date.now().toString().slice(-6)}`,
      date: now.toISOString().slice(0, 10),
    }));
  }, []);

  const [hotels, setHotels] = useState<HotelLine[]>([]);
  const [cabs, setCabs] = useState<CabLine[]>([]);
  const [pujas, setPujas] = useState<ExtraLine[]>([]);
  const [extras, setExtras] = useState<ExtraLine[]>([]);
  const [itinerary, setItinerary] = useState<ItineraryLine[]>([]);

  const [inclusions, setInclusions] = useState(
    "Accommodation as mentioned\nLocal transportation as per itinerary\nAssistance from Tirthya team"
  );

  const [exclusions, setExclusions] = useState(
    "Personal expenses\nMeals unless specifically mentioned\nAny additional services not listed"
  );

  const [activeTab, setActiveTab] = useState("customer");
  const [showInternal, setShowInternal] = useState(true);

  const addHotel = () => {
    const hotel = "Hotel Lakhdataar";
    const room = hotelRates[hotel][0];

    setHotels((old) => [
      ...old,
      {
        id: newId(),
        hotel,
        room: room.room,
        rooms: 1,
        nights: 1,
        rate: room.sell,
        taxNote: room.note,
      },
    ]);
  };

  const updateHotel = (id: number, patch: Partial<HotelLine>) => {
    setHotels((old) =>
      old.map((line) => (line.id === id ? { ...line, ...patch } : line))
    );
  };

  const addCab = () => {
    const supplier = "Raghav Yadav";
    const vehicle = cabRates[supplier].vehicles[0];

    setCabs((old) => [
      ...old,
      {
        id: newId(),
        supplier,
        vehicle: vehicle.name,
        routes: [],
        mode: "route",
        quantity: 1,
        days: 1,
        km: 100,
      },
    ]);
  };

  const updateCab = (id: number, patch: Partial<CabLine>) => {
    setCabs((old) =>
      old.map((line) => (line.id === id ? { ...line, ...patch } : line))
    );
  };

  const addPuja = () => {
    const item = pujaRates[0];

    setPujas((old) => [
      ...old,
      { id: newId(), name: item.name, quantity: 1, rate: item.sell },
    ]);
  };

  const addExtra = () => {
    setExtras((old) => [
      ...old,
      { id: newId(), name: "", quantity: 1, rate: 0 },
    ]);
  };

  const addDay = () => {
    setItinerary((old) => [
      ...old,
      {
        id: newId(),
        day: `Day ${old.length + 1}`,
        title: "",
        description: "",
      },
    ]);
  };

  const hotelTotal = hotels.reduce(
    (sum, item) => sum + item.rooms * item.nights * item.rate,
    0
  );

  const cabLineRate = (cab: CabLine) => {
    const vehicle = cabRates[cab.supplier].vehicles.find(
      (v) => v.name === cab.vehicle
    );

    if (!vehicle) return 0;

    if (cab.mode === "route") {
      return cab.routes.reduce((sum, route) => {
        const index = destinations.indexOf(route);
        return sum + (vehicle.routes[index] || 0);
      }, 0);
    }

    if (cab.mode === "day") return vehicle.day * cab.days;
    if (cab.mode === "km") return vehicle.km * cab.km;
    if (cab.mode === "night") return vehicle.night * cab.days;
    if (cab.mode === "driver") return vehicle.driver * cab.days;

    return 0;
  };

  const cabTotal = cabs.reduce(
    (sum, cab) => sum + cabLineRate(cab) * cab.quantity,
    0
  );

  const pujaTotal = pujas.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );

  const extraTotal = extras.reduce(
    (sum, item) => sum + item.quantity * item.rate,
    0
  );

  const subtotal = hotelTotal + cabTotal + pujaTotal + extraTotal;
  const discount = Math.max(0, Number(quote.discount) || 0);
  const total = Math.max(0, subtotal - discount);
  const balance = Math.max(0, total - Number(quote.paid || 0));

  const exportImage = async () => {
    const node = document.getElementById("quotation-preview");
    if (!node) return;

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#111111",
    });

    const link = document.createElement("a");
    link.download = `Tirthya-${quote.number}.png`;
    link.href = dataUrl;
    link.click();
  };

  const exportPDF = async () => {
    const node = document.getElementById("quotation-preview");
    if (!node) return;

    const dataUrl = await toPng(node, {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: "#111111",
    });

    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = 210;
    const pageHeight = 297;
    const image = new Image();

    image.src = dataUrl;

    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Could not load quotation image"));
    });

    const imageHeight = (image.height * pageWidth) / image.width;

    let remaining = imageHeight;
    let position = 0;

    pdf.addImage(dataUrl, "PNG", 0, position, pageWidth, imageHeight);
    remaining -= pageHeight;

    while (remaining > 0) {
      position = remaining - imageHeight;
      pdf.addPage();
      pdf.addImage(dataUrl, "PNG", 0, position, pageWidth, imageHeight);
      remaining -= pageHeight;
    }

    pdf.save(`Tirthya-${quote.number}.pdf`);
  };

  const tabs = [
    ["customer", "Customer"],
    ["hotel", "Hotels"],
    ["cab", "Transport"],
    ["puja", "Puja"],
    ["extras", "Add-ons"],
    ["itinerary", "Itinerary"],
    ["terms", "Terms"],
  ];

  const inputClass =
    "w-full rounded-lg border border-[#39352c] bg-[#171717] px-3 py-2.5 text-sm text-white outline-none focus:border-[#c9a45c]";

  const labelClass = "mb-1.5 block text-xs font-medium text-[#b9ae98]";

  const panelClass =
    "rounded-xl border border-[#373126] bg-[#171717] p-4 md:p-5";

  return (
    <main className="min-h-screen bg-[#0c0c0c] text-white">
      <header className="border-b border-[#3b3324] bg-[#101010] px-5 py-4">
        <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
          <div>
            <div className="text-xl font-semibold tracking-[0.25em] text-[#d4b46f]">
              TIRTHYA
            </div>
            <p className="mt-1 text-[10px] tracking-[0.2em] text-[#8e836e]">
              HAR LAMHA, APNA SA. · QUOTATION STUDIO
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setShowInternal(!showInternal)}
              className="flex items-center gap-2 rounded-lg border border-[#51452d] px-3 py-2 text-xs text-[#d4b46f]"
            >
              <Settings2 size={15} />
              {showInternal ? "Hide" : "Show"} internal rates
            </button>

            <button
              onClick={exportImage}
              className="flex items-center gap-2 rounded-lg bg-[#c9a45c] px-3 py-2 text-xs font-semibold text-black hover:bg-[#dfbd7a]"
            >
              <FileImage size={15} /> PNG
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center gap-2 rounded-lg border border-[#c9a45c] px-3 py-2 text-xs text-[#e1c27f] hover:bg-[#292217]"
            >
              <FileText size={15} /> PDF
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] grid-cols-1 gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.85fr)] lg:p-6">
        <section className="min-w-0">
          <div className="mb-4 flex flex-wrap gap-2">
            {tabs.map(([key, title]) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={`rounded-lg px-3 py-2 text-xs ${
                  activeTab === key
                    ? "bg-[#c9a45c] font-semibold text-black"
                    : "border border-[#38332a] bg-[#171717] text-[#c4b89f]"
                }`}
              >
                {title}
              </button>
            ))}
          </div>

          {activeTab === "customer" && (
            <div className={panelClass}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-[#d8b76f]">
                <User size={18} /> Customer details
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Customer name</span>
                  <input
                    className={inputClass}
                    value={customer.name}
                    onChange={(e) =>
                      setCustomer({ ...customer, name: e.target.value })
                    }
                    placeholder="Enter customer name"
                  />
                </label>

                <label>
                  <span className={labelClass}>Phone number</span>
                  <input
                    className={inputClass}
                    value={customer.phone}
                    onChange={(e) =>
                      setCustomer({ ...customer, phone: e.target.value })
                    }
                    placeholder="+91"
                  />
                </label>

                <label>
                  <span className={labelClass}>Email</span>
                  <input
                    className={inputClass}
                    value={customer.email}
                    onChange={(e) =>
                      setCustomer({ ...customer, email: e.target.value })
                    }
                    placeholder="Email address"
                  />
                </label>

                <label>
                  <span className={labelClass}>Pickup location</span>
                  <input
                    className={inputClass}
                    value={customer.pickup}
                    onChange={(e) =>
                      setCustomer({ ...customer, pickup: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Arrival date</span>
                  <input
                    type="date"
                    className={inputClass}
                    value={customer.arrival}
                    onChange={(e) =>
                      setCustomer({ ...customer, arrival: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Departure date</span>
                  <input
                    type="date"
                    className={inputClass}
                    value={customer.departure}
                    onChange={(e) =>
                      setCustomer({ ...customer, departure: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Adults</span>
                  <input
                    type="number"
                    min="1"
                    className={inputClass}
                    value={customer.adults}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        adults: Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Children</span>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={customer.children}
                    onChange={(e) =>
                      setCustomer({
                        ...customer,
                        children: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className={labelClass}>Customer notes</span>
                <textarea
                  className={inputClass}
                  rows={3}
                  value={customer.notes}
                  onChange={(e) =>
                    setCustomer({ ...customer, notes: e.target.value })
                  }
                  placeholder="Special requirements..."
                />
              </label>
            </div>
          )}

          {activeTab === "hotel" && (
            <div className={panelClass}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#d8b76f]">
                  <Hotel size={18} /> Hotel selection
                </h2>

                <button
                  onClick={addHotel}
                  className="flex items-center gap-1 rounded-lg bg-[#c9a45c] px-3 py-2 text-xs font-semibold text-black"
                >
                  <Plus size={15} /> Add hotel
                </button>
              </div>

              {hotels.length === 0 && (
                <p className="rounded-lg border border-dashed border-[#51452d] p-6 text-center text-sm text-[#93866d]">
                  No hotels added. Click Add hotel to begin.
                </p>
              )}

              {hotels.map((item) => {
                const selectedRoom = hotelRates[item.hotel].find(
                  (r) => r.room === item.room
                );

                return (
                  <div
                    key={item.id}
                    className="mb-3 rounded-lg border border-[#40392d] bg-[#111] p-4"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-[#e0c17e]">
                        Hotel entry
                      </span>

                      <button
                        onClick={() =>
                          setHotels((old) =>
                            old.filter((x) => x.id !== item.id)
                          )
                        }
                        className="text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label>
                        <span className={labelClass}>Hotel</span>
                        <select
                          className={inputClass}
                          value={item.hotel}
                          onChange={(e) => {
                            const nextHotel = e.target.value;
                            const first = hotelRates[nextHotel][0];

                            updateHotel(item.id, {
                              hotel: nextHotel,
                              room: first.room,
                              rate: first.sell,
                              taxNote: first.note,
                            });
                          }}
                        >
                          {Object.keys(hotelRates).map((name) => (
                            <option key={name}>{name}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className={labelClass}>Room category</span>
                        <select
                          className={inputClass}
                          value={item.room}
                          onChange={(e) => {
                            const room = hotelRates[item.hotel].find(
                              (r) => r.room === e.target.value
                            )!;

                            updateHotel(item.id, {
                              room: room.room,
                              rate: room.sell,
                              taxNote: room.note,
                            });
                          }}
                        >
                          {hotelRates[item.hotel].map((r) => (
                            <option key={r.room} value={r.room}>
                              {r.room}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className={labelClass}>Number of rooms</span>
                        <input
                          type="number"
                          min="1"
                          className={inputClass}
                          value={item.rooms}
                          onChange={(e) =>
                            updateHotel(item.id, {
                              rooms: Number(e.target.value),
                            })
                          }
                        />
                      </label>

                      <label>
                        <span className={labelClass}>Number of nights</span>
                        <input
                          type="number"
                          min="1"
                          className={inputClass}
                          value={item.nights}
                          onChange={(e) =>
                            updateHotel(item.id, {
                              nights: Number(e.target.value),
                            })
                          }
                        />
                      </label>

                      <label>
                        <span className={labelClass}>
                          Customer rate / room / night
                        </span>
                        <input
                          type="number"
                          className={inputClass}
                          value={item.rate}
                          onChange={(e) =>
                            updateHotel(item.id, {
                              rate: Number(e.target.value),
                            })
                          }
                        />
                      </label>

                      <div className="flex items-end text-xs text-[#9d927c]">
                        {selectedRoom?.note || item.taxNote}
                      </div>
                    </div>

                    {showInternal && (
                      <p className="mt-3 text-xs text-[#b69a61]">
                        Internal base rate: {money(selectedRoom?.cost || 0)} ·
                        Customer rate: {money(item.rate)}
                      </p>
                    )}

                    <p className="mt-2 text-right text-sm font-semibold text-[#e0c17e]">
                      Line total:{" "}
                      {money(item.rooms * item.nights * item.rate)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "cab" && (
            <div className={panelClass}>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-[#d8b76f]">
                  <Car size={18} /> Transport & cabs
                </h2>

                <button
                  onClick={addCab}
                  className="flex items-center gap-1 rounded-lg bg-[#c9a45c] px-3 py-2 text-xs font-semibold text-black"
                >
                  <Plus size={15} /> Add cab
                </button>
              </div>

              <p className="mb-4 text-xs leading-5 text-[#9e927a]">
                Add separate vehicles as needed. Each vehicle can be assigned
                multiple routes, and the same vehicle can be added again for
                another route or service.
              </p>

              {cabs.length === 0 && (
                <p className="rounded-lg border border-dashed border-[#51452d] p-6 text-center text-sm text-[#93866d]">
                  No cabs added yet.
                </p>
              )}

              {cabs.map((cab, index) => {
                const supplierVehicles = cabRates[cab.supplier].vehicles;

                const selectedVehicle = supplierVehicles.find(
                  (v) => v.name === cab.vehicle
                );

                const baseRate = cabLineRate(cab);

                return (
                  <div
                    key={cab.id}
                    className="mb-4 rounded-xl border border-[#49402e] bg-[#111] p-4"
                  >
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-[#e2c47e]">
                          Cab {index + 1}
                        </p>
                        <p className="text-[11px] text-[#847962]">
                          Vehicle and route combination
                        </p>
                      </div>

                      <button
                        onClick={() =>
                          setCabs((old) => old.filter((x) => x.id !== cab.id))
                        }
                        className="text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <label>
                        <span className={labelClass}>Internal supplier</span>
                        <select
                          className={inputClass}
                          value={cab.supplier}
                          onChange={(e) => {
                            const supplier = e.target.value;
                            const first = cabRates[supplier].vehicles[0];

                            updateCab(cab.id, {
                              supplier,
                              vehicle: first.name,
                              routes: [],
                            });
                          }}
                        >
                          {Object.keys(cabRates).map((s) => (
                            <option key={s}>{s}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className={labelClass}>Vehicle</span>
                        <select
                          className={inputClass}
                          value={cab.vehicle}
                          onChange={(e) =>
                            updateCab(cab.id, {
                              vehicle: e.target.value,
                            })
                          }
                        >
                          {supplierVehicles.map((v) => (
                            <option key={v.name}>{v.name}</option>
                          ))}
                        </select>
                      </label>

                      <label>
                        <span className={labelClass}>Service type</span>
                        <select
                          className={inputClass}
                          value={cab.mode}
                          onChange={(e) =>
                            updateCab(cab.id, {
                              mode: e.target.value as CabLine["mode"],
                              routes: [],
                            })
                          }
                        >
                          <option value="route">Route-based trip</option>
                          <option value="day">Per day</option>
                          <option value="km">Per kilometre</option>
                          <option value="night">Night halt</option>
                          <option value="driver">Driver allowance</option>
                        </select>
                      </label>

                      <label>
                        <span className={labelClass}>Vehicle quantity</span>
                        <input
                          type="number"
                          min="1"
                          className={inputClass}
                          value={cab.quantity}
                          onChange={(e) =>
                            updateCab(cab.id, {
                              quantity: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    </div>

                    {cab.mode === "route" && (
                      <div className="mt-4">
                        <span className={labelClass}>
                          Select multiple routes
                        </span>

                        <details className="group relative">
                          <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-[#49402e] bg-[#171717] px-3 py-3 text-sm text-white">
                            <span>
                              {cab.routes.length
                                ? `${cab.routes.length} route(s) selected`
                                : "Choose routes"}
                            </span>
                            <ChevronDown
                              size={16}
                              className="text-[#c9a45c]"
                            />
                          </summary>

                          <div className="mt-2 grid grid-cols-1 gap-2 rounded-lg border border-[#49402e] bg-[#1b1b1b] p-3 sm:grid-cols-2">
                            {destinations.map((route) => (
                              <label
                                key={route}
                                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm text-[#d6c9ae] hover:bg-[#29251d]"
                              >
                                <input
                                  type="checkbox"
                                  className="accent-[#c9a45c]"
                                  checked={cab.routes.includes(route)}
                                  onChange={(e) => {
                                    const routes = e.target.checked
                                      ? [...cab.routes, route]
                                      : cab.routes.filter((r) => r !== route);

                                    updateCab(cab.id, { routes });
                                  }}
                                />
                                {route}
                              </label>
                            ))}
                          </div>
                        </details>

                        {cab.routes.length > 0 && (
                          <div className="mt-3 space-y-2">
                            {cab.routes.map((route) => {
                              const routeIndex = destinations.indexOf(route);
                              const routeRate =
                                selectedVehicle?.routes[routeIndex] || 0;

                              return (
                                <div
                                  key={route}
                                  className="flex items-center justify-between rounded-lg border border-[#393329] bg-[#191919] px-3 py-2 text-xs"
                                >
                                  <span className="text-[#d9c9a5]">
                                    {route}
                                  </span>
                                  <span className="text-[#e1bd72]">
                                    {money(routeRate)}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}

                    {(cab.mode === "day" ||
                      cab.mode === "night" ||
                      cab.mode === "driver") && (
                      <label className="mt-4 block">
                        <span className={labelClass}>
                          {cab.mode === "day"
                            ? "Number of days"
                            : "Number of nights / days"}
                        </span>

                        <input
                          type="number"
                          min="1"
                          className={inputClass}
                          value={cab.days}
                          onChange={(e) =>
                            updateCab(cab.id, {
                              days: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    )}

                    {cab.mode === "km" && (
                      <label className="mt-4 block">
                        <span className={labelClass}>Total kilometres</span>

                        <input
                          type="number"
                          min="1"
                          className={inputClass}
                          value={cab.km}
                          onChange={(e) =>
                            updateCab(cab.id, {
                              km: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    )}

                    {cab.mode === "route" && cab.routes.length === 0 && (
                      <p className="mt-3 text-xs text-amber-400">
                        Select at least one route to calculate this cab.
                      </p>
                    )}

                    {showInternal && (
                      <div className="mt-4 rounded-lg border border-[#393329] bg-[#191919] p-3 text-xs text-[#a99a7d]">
                        <p>Internal supplier: {cab.supplier}</p>
                        <p>
                          Calculated rate: {money(baseRate)} × {cab.quantity}
                        </p>
                      </div>
                    )}

                    <div className="mt-4 flex justify-between border-t border-[#3a3328] pt-3">
                      <span className="text-xs text-[#a99a7d]">
                        Cab line total
                      </span>

                      <span className="font-semibold text-[#e1bd72]">
                        {money(baseRate * cab.quantity)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "puja" && (
            <div className={panelClass}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#d8b76f]">
                  Puja services
                </h2>

                <button
                  onClick={addPuja}
                  className="flex items-center gap-1 rounded-lg bg-[#c9a45c] px-3 py-2 text-xs font-semibold text-black"
                >
                  <Plus size={15} /> Add puja
                </button>
              </div>

              {pujas.map((item) => (
                <div
                  key={item.id}
                  className="mb-3 grid grid-cols-1 gap-3 rounded-lg border border-[#40392d] bg-[#111] p-3 sm:grid-cols-[1fr_90px_120px_35px]"
                >
                  <label>
                    <span className={labelClass}>Puja package</span>
                    <select
                      className={inputClass}
                      value={item.name}
                      onChange={(e) => {
                        const selected = pujaRates.find(
                          (p) => p.name === e.target.value
                        )!;

                        setPujas((old) =>
                          old.map((x) =>
                            x.id === item.id
                              ? {
                                  ...x,
                                  name: selected.name,
                                  rate: selected.sell,
                                }
                              : x
                          )
                        );
                      }}
                    >
                      {pujaRates.map((p) => (
                        <option key={p.name}>{p.name}</option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span className={labelClass}>Quantity</span>
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={item.quantity}
                      onChange={(e) =>
                        setPujas((old) =>
                          old.map((x) =>
                            x.id === item.id
                              ? { ...x, quantity: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  </label>

                  <label>
                    <span className={labelClass}>Customer rate</span>
                    <input
                      type="number"
                      className={inputClass}
                      value={item.rate}
                      onChange={(e) =>
                        setPujas((old) =>
                          old.map((x) =>
                            x.id === item.id
                              ? { ...x, rate: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  </label>

                  <button
                    onClick={() =>
                      setPujas((old) => old.filter((x) => x.id !== item.id))
                    }
                    className="self-end pb-2 text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "extras" && (
            <div className={panelClass}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#d8b76f]">
                  Add-on services
                </h2>

                <button
                  onClick={addExtra}
                  className="flex items-center gap-1 rounded-lg bg-[#c9a45c] px-3 py-2 text-xs font-semibold text-black"
                >
                  <Plus size={15} /> Add service
                </button>
              </div>

              <p className="mb-3 text-xs text-[#93866d]">
                Add local experiences, food, photography, or any other
                customer-facing service.
              </p>

              {extras.map((item) => (
                <div
                  key={item.id}
                  className="mb-3 grid grid-cols-1 gap-3 rounded-lg border border-[#40392d] bg-[#111] p-3 sm:grid-cols-[1fr_90px_120px_35px]"
                >
                  <label>
                    <span className={labelClass}>Service name</span>
                    <input
                      className={inputClass}
                      value={item.name}
                      onChange={(e) =>
                        setExtras((old) =>
                          old.map((x) =>
                            x.id === item.id
                              ? { ...x, name: e.target.value }
                              : x
                          )
                        )
                      }
                      placeholder="Enter service"
                    />
                  </label>

                  <label>
                    <span className={labelClass}>Quantity</span>
                    <input
                      type="number"
                      min="1"
                      className={inputClass}
                      value={item.quantity}
                      onChange={(e) =>
                        setExtras((old) =>
                          old.map((x) =>
                            x.id === item.id
                              ? { ...x, quantity: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  </label>

                  <label>
                    <span className={labelClass}>Rate</span>
                    <input
                      type="number"
                      className={inputClass}
                      value={item.rate}
                      onChange={(e) =>
                        setExtras((old) =>
                          old.map((x) =>
                            x.id === item.id
                              ? { ...x, rate: Number(e.target.value) }
                              : x
                          )
                        )
                      }
                    />
                  </label>

                  <button
                    onClick={() =>
                      setExtras((old) => old.filter((x) => x.id !== item.id))
                    }
                    className="self-end pb-2 text-red-400"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === "itinerary" && (
            <div className={panelClass}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#d8b76f]">
                  Trip itinerary
                </h2>

                <button
                  onClick={addDay}
                  className="flex items-center gap-1 rounded-lg bg-[#c9a45c] px-3 py-2 text-xs font-semibold text-black"
                >
                  <Plus size={15} /> Add day
                </button>
              </div>

              {itinerary.map((day) => (
                <div
                  key={day.id}
                  className="mb-3 rounded-lg border border-[#40392d] bg-[#111] p-3"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#e1bd72]">
                      {day.day}
                    </span>

                    <button
                      onClick={() =>
                        setItinerary((old) =>
                          old.filter((x) => x.id !== day.id)
                        )
                      }
                      className="text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <input
                    className={inputClass}
                    value={day.title}
                    onChange={(e) =>
                      setItinerary((old) =>
                        old.map((x) =>
                          x.id === day.id
                            ? { ...x, title: e.target.value }
                            : x
                        )
                      )
                    }
                    placeholder="Day heading / destination"
                  />

                  <textarea
                    className={`${inputClass} mt-3`}
                    rows={3}
                    value={day.description}
                    onChange={(e) =>
                      setItinerary((old) =>
                        old.map((x) =>
                          x.id === day.id
                            ? { ...x, description: e.target.value }
                            : x
                        )
                      )
                    }
                    placeholder="Describe the day's plan..."
                  />
                </div>
              ))}
            </div>
          )}

          {activeTab === "terms" && (
            <div className={panelClass}>
              <h2 className="mb-4 text-lg font-semibold text-[#d8b76f]">
                Quotation settings & terms
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label>
                  <span className={labelClass}>Quotation number</span>
                  <input
                    className={inputClass}
                    value={quote.number}
                    onChange={(e) =>
                      setQuote({ ...quote, number: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Quotation date</span>
                  <input
                    type="date"
                    className={inputClass}
                    value={quote.date}
                    onChange={(e) =>
                      setQuote({ ...quote, date: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Validity</span>
                  <input
                    className={inputClass}
                    value={quote.valid}
                    onChange={(e) =>
                      setQuote({ ...quote, valid: e.target.value })
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Discount (₹)</span>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={quote.discount}
                    onChange={(e) =>
                      setQuote({
                        ...quote,
                        discount: Number(e.target.value),
                      })
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Amount received (₹)</span>
                  <input
                    type="number"
                    min="0"
                    className={inputClass}
                    value={quote.paid}
                    onChange={(e) =>
                      setQuote({ ...quote, paid: Number(e.target.value) })
                    }
                  />
                </label>

                <label>
                  <span className={labelClass}>Payment mode</span>
                  <input
                    className={inputClass}
                    value={quote.paymentMode}
                    onChange={(e) =>
                      setQuote({ ...quote, paymentMode: e.target.value })
                    }
                  />
                </label>
              </div>

              <label className="mt-4 block">
                <span className={labelClass}>Payment instructions</span>
                <textarea
                  rows={3}
                  className={inputClass}
                  value={quote.paymentNote}
                  onChange={(e) =>
                    setQuote({ ...quote, paymentNote: e.target.value })
                  }
                />
              </label>

              <label className="mt-4 block">
                <span className={labelClass}>Inclusions (one per line)</span>
                <textarea
                  rows={5}
                  className={inputClass}
                  value={inclusions}
                  onChange={(e) => setInclusions(e.target.value)}
                />
              </label>

              <label className="mt-4 block">
                <span className={labelClass}>Exclusions (one per line)</span>
                <textarea
                  rows={5}
                  className={inputClass}
                  value={exclusions}
                  onChange={(e) => setExclusions(e.target.value)}
                />
              </label>

              <label className="mt-4 block">
                <span className={labelClass}>Terms & conditions</span>
                <textarea
                  rows={5}
                  className={inputClass}
                  value={quote.terms}
                  onChange={(e) =>
                    setQuote({ ...quote, terms: e.target.value })
                  }
                />
              </label>
            </div>
          )}
        </section>

        <aside className="min-w-0">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-[#d8b76f]">
              <Eye size={16} /> Live customer preview
            </h2>

            <span className="text-[10px] text-[#82765e]">
              Customer-facing view
            </span>
          </div>

          <div
            id="quotation-preview"
            className="overflow-hidden rounded-xl border border-[#78613a] bg-[#111] text-white shadow-2xl"
          >
            <div className="border-b border-[#66512f] bg-[#17140f] px-6 py-7 text-center">
              <div className="text-3xl font-semibold tracking-[0.28em] text-[#d8b76f]">
                TIRTHYA
              </div>

              <p className="mt-2 text-[9px] tracking-[0.24em] text-[#b7a57c]">
                HAR LAMHA, APNA SA.
              </p>

              <div className="mx-auto mt-4 h-px w-24 bg-[#b9944e]" />

              <h1 className="mt-4 text-xl font-semibold tracking-wide">
                TRAVEL QUOTATION
              </h1>

              <p className="mt-1 text-[10px] text-[#b6a98e]">
                DEOGHAR · JHARKHAND
              </p>
            </div>

            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-[#9e8b65]">
                    Quotation no.
                  </p>
                  <p className="mt-1 font-semibold">{quote.number}</p>
                </div>

                <div className="text-right">
                  <p className="text-[9px] uppercase tracking-widest text-[#9e8b65]">
                    Date
                  </p>
                  <p className="mt-1 font-semibold">{quote.date || "—"}</p>
                </div>
              </div>

              <div className="rounded-lg border border-[#453a28] bg-[#191713] p-4">
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d4b46f]">
                  Guest details
                </p>

                <p className="text-base font-semibold">
                  {customer.name || "Guest Name"}
                </p>

                <div className="mt-2 grid grid-cols-2 gap-y-2 text-[11px] text-[#c3b79e]">
                  <span>Phone: {customer.phone || "—"}</span>
                  <span>Guests: {customer.adults + customer.children}</span>
                  <span>Arrival: {customer.arrival || "—"}</span>
                  <span>Departure: {customer.departure || "—"}</span>
                  <span className="col-span-2">
                    Pickup: {customer.pickup || "—"}
                  </span>
                </div>
              </div>

              {(hotels.length > 0 ||
                cabs.length > 0 ||
                pujas.length > 0 ||
                extras.length > 0) && (
                <div>
                  <p className="mb-3 border-b border-[#66512f] pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d4b46f]">
                    Package details
                  </p>

                  {hotels.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-semibold text-[#e2c47e]">
                        Accommodation
                      </p>

                      {hotels.map((h) => (
                        <div
                          key={h.id}
                          className="mb-2 flex justify-between gap-3 text-[11px]"
                        >
                          <div>
                            <p className="font-medium">{h.hotel}</p>
                            <p className="mt-1 text-[#a99c82]">
                              {h.room} · {h.rooms} room(s) · {h.nights} night(s)
                            </p>
                          </div>

                          <span className="whitespace-nowrap">
                            {money(h.rooms * h.nights * h.rate)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {cabs.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-semibold text-[#e2c47e]">
                        Transportation
                      </p>

                      {cabs.map((cab) => {
                        const lineTotal = cabLineRate(cab) * cab.quantity;

                        const serviceDescription =
                          cab.mode === "route"
                            ? cab.routes.join(", ") || "Route not selected"
                            : cab.mode === "day"
                              ? `${cab.days} day(s)`
                              : cab.mode === "km"
                                ? `${cab.km} km`
                                : cab.mode === "night"
                                  ? `${cab.days} night(s) – night halt`
                                  : `${cab.days} day(s) – driver allowance`;

                        return (
                          <div
                            key={cab.id}
                            className="mb-2 flex justify-between gap-3 text-[11px]"
                          >
                            <div>
                              <p className="font-medium">
                                {cab.vehicle}
                                {cab.quantity > 1 ? ` × ${cab.quantity}` : ""}
                              </p>

                              <p className="mt-1 text-[#a99c82]">
                                {serviceDescription}
                              </p>
                            </div>

                            <span className="whitespace-nowrap">
                              {money(lineTotal)}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {pujas.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-semibold text-[#e2c47e]">
                        Puja & spiritual services
                      </p>

                      {pujas.map((p) => (
                        <div
                          key={p.id}
                          className="mb-2 flex justify-between gap-3 text-[11px]"
                        >
                          <span>
                            {p.name} × {p.quantity}
                          </span>
                          <span>{money(p.rate * p.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {extras.length > 0 && (
                    <div className="mb-4">
                      <p className="mb-2 text-xs font-semibold text-[#e2c47e]">
                        Additional services
                      </p>

                      {extras.map((x) => (
                        <div
                          key={x.id}
                          className="mb-2 flex justify-between gap-3 text-[11px]"
                        >
                          <span>
                            {x.name || "Additional service"} × {x.quantity}
                          </span>
                          <span>{money(x.rate * x.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {itinerary.length > 0 && (
                <div>
                  <p className="mb-3 border-b border-[#66512f] pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#d4b46f]">
                    Your itinerary
                  </p>

                  <div className="space-y-3">
                    {itinerary.map((day) => (
                      <div key={day.id} className="flex gap-3 text-[11px]">
                        <div className="min-w-12 font-semibold text-[#d8b76f]">
                          {day.day}
                        </div>

                        <div>
                          <p className="font-semibold">
                            {day.title || "Destination / activity"}
                          </p>

                          <p className="mt-1 whitespace-pre-wrap leading-5 text-[#b8ac94]">
                            {day.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(inclusions.trim() || exclusions.trim()) && (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {inclusions.trim() && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#d4b46f]">
                        Inclusions
                      </p>

                      <ul className="space-y-1.5 text-[10px] leading-4 text-[#c2b69e]">
                        {inclusions
                          .split("\n")
                          .filter(Boolean)
                          .map((line, i) => (
                            <li key={i}>• {line}</li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {exclusions.trim() && (
                    <div>
                      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#d4b46f]">
                        Exclusions
                      </p>

                      <ul className="space-y-1.5 text-[10px] leading-4 text-[#c2b69e]">
                        {exclusions
                          .split("\n")
                          .filter(Boolean)
                          .map((line, i) => (
                            <li key={i}>• {line}</li>
                          ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="rounded-lg border border-[#715a32] bg-[#1c1810] p-4">
                <div className="flex justify-between text-xs text-[#c6b99f]">
                  <span>Package subtotal</span>
                  <span>{money(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="mt-2 flex justify-between text-xs text-[#c6b99f]">
                    <span>Discount</span>
                    <span>- {money(discount)}</span>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-between border-t border-[#5b492c] pt-3">
                  <span className="text-sm font-semibold text-[#e1c27e]">
                    Grand total
                  </span>

                  <span className="text-2xl font-bold text-[#e1c27e]">
                    {money(total)}
                  </span>
                </div>

                {Number(quote.paid) > 0 && (
                  <>
                    <div className="mt-3 flex justify-between text-xs text-[#c6b99f]">
                      <span>Amount received</span>
                      <span>{money(Number(quote.paid))}</span>
                    </div>

                    <div className="mt-2 flex justify-between text-xs font-semibold text-white">
                      <span>Balance due</span>
                      <span>{money(balance)}</span>
                    </div>
                  </>
                )}

                <p className="mt-3 text-[9px] text-[#a99a7d]">
                  Quotation valid for {quote.valid}.
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#d4b46f]">
                  Payment details
                </p>

                <p className="text-[10px] text-[#c2b69e]">
                  Payment mode: {quote.paymentMode}
                </p>

                <p className="mt-1 whitespace-pre-wrap text-[10px] leading-4 text-[#a99c82]">
                  {quote.paymentNote}
                </p>
              </div>

              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-[#d4b46f]">
                  Terms & conditions
                </p>

                <p className="whitespace-pre-wrap text-[9px] leading-4 text-[#a99c82]">
                  {quote.terms}
                </p>
              </div>

              <div className="border-t border-[#66512f] pt-4 text-center">
                <p className="text-sm font-semibold tracking-[0.15em] text-[#d8b76f]">
                  TIRTHYA
                </p>

                <p className="mt-1 text-[9px] text-[#a99c82]">
                  Har Lamha, Apna Sa.
                </p>

                <p className="mt-3 text-[10px] text-[#c9b994]">
                  +91 9199752699 · tirthya.in
                </p>

                <p className="mt-2 text-[9px] text-[#81745a]">
                  Thank you for choosing Tirthya.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <button
              onClick={exportImage}
              className="flex items-center justify-center gap-2 rounded-lg bg-[#c9a45c] px-3 py-3 text-xs font-semibold text-black"
            >
              <Download size={15} /> Download PNG
            </button>

            <button
              onClick={exportPDF}
              className="flex items-center justify-center gap-2 rounded-lg border border-[#c9a45c] px-3 py-3 text-xs font-semibold text-[#e1c27e]"
            >
              <FileText size={15} /> Download PDF
            </button>
          </div>

          <p className="mt-3 text-center text-[10px] text-[#776d5b]">
            Internal supplier rates and costs are not included in the exported
            quotation.
          </p>
        </aside>
      </div>
    </main>
  );
}
