import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { uuidv6 } from "../lib/utils/uuid-v6";
import { relations } from "drizzle-orm";
import { SnippetLabelModel } from "./snippet-label";

export const SnippetModel = sqliteTable('snippet_tab', {
    id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
    uuid: text('uuid').unique().notNull().$defaultFn(() => uuidv6()),
    createAt: integer('create_at', { mode: 'timestamp' }), // Date
    updateAt: integer('update_at', { mode: 'timestamp' }), // Date

    title: text('title'),
    description: text('title'),
});

export const SnippetModelRelations = relations(SnippetModel, ({ many }) => ({
    snippetsToLabels: many(SnippetLabelModel),
}));