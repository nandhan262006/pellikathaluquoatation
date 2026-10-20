import { sql } from "drizzle-orm";
import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const service = sqliteTable("Service", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  duration: integer("duration").notNull(),
  price: text("price").notNull(),
  image: text("image"),
  isActive: integer("isActive").notNull().default(1),
  createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updatedAt").notNull().default(sql`(datetime('now'))`),
});

export const photographer = sqliteTable("Photographer", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  bio: text("bio"),
  image: text("image"),
  isActive: integer("isActive").notNull().default(1),
  createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
});

export const booking = sqliteTable("Booking", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("clientName").notNull(),
  clientEmail: text("clientEmail").notNull(),
  clientPhone: text("clientPhone").notNull(),
  notes: text("notes").notNull().default(""),
  bookingDate: text("bookingDate").notNull(),
  startTime: text("startTime").notNull(),
  endTime: text("endTime").notNull(),
  totalPrice: text("totalPrice").notNull(),
  status: text("status").notNull().default("confirmed"),
  createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
  serviceId: integer("serviceId").notNull().references(() => service.id),
  photographerId: integer("photographerId").notNull().references(() => photographer.id),
});

export const eventTemplate = sqliteTable("EventTemplate", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  typeId: text("typeId").notNull(),
  name: text("name").notNull(),
  tagline: text("tagline").notNull().default(""),
  description: text("description").notNull().default(""),
  icon: text("icon").notNull().default("heart"),
  market: text("market").notNull().default("IN"),
  isActive: integer("isActive").notNull().default(1),
  defaultMaxReels: integer("defaultMaxReels").notNull().default(3),
  defaultReelPrice: integer("defaultReelPrice").notNull().default(6000),
  coverageOptions: text("coverageOptions").notNull().default("[]"),
  addOnOptions: text("addOnOptions").notNull().default("[]"),
  defaultPrices: text("defaultPrices").notNull().default("{}"),
  createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updatedAt").notNull().default(sql`(datetime('now'))`),
});

export const subEvent = sqliteTable("SubEvent", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  subEventId: text("subEventId").notNull(),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  defaultSelected: integer("defaultSelected").notNull().default(0),
  maxReels: integer("maxReels"),
  sortOrder: integer("sortOrder").notNull().default(0),
  priceOverrides: text("priceOverrides").notNull().default("{}"),
  templateId: integer("templateId").notNull().references(() => eventTemplate.id, { onDelete: "cascade" }),
});

export const optionCatalog = sqliteTable("OptionCatalog", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  optionId: text("optionId").notNull().unique(),
  kind: text("kind").notNull(),
  label: text("label").notNull(),
  icon: text("icon").notNull().default("camera"),
  description: text("description").notNull().default(""),
  sortOrder: integer("sortOrder").notNull().default(0),
});

export const estimateLead = sqliteTable("EstimateLead", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  clientName: text("clientName").notNull(),
  clientPhone: text("clientPhone").notNull(),
  eventType: text("eventType").notNull(),
  eventName: text("eventName").notNull().default(""),
  market: text("market").notNull().default("IN"),
  estimateData: text("estimateData").notNull().default("{}"),
  quotationData: text("quotationData").notNull().default("{}"),
  status: text("status").notNull().default("pending"),
  createdAt: text("createdAt").notNull().default(sql`(datetime('now'))`),
});
