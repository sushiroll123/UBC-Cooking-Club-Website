import { defineField, defineType } from "sanity";

export const tag = defineType({
  name: "tag",
  title: "Tag",
  type: "document",
  fields: [
    defineField({ name: "label", type: "string", validation: Rule => Rule.required() }),
    defineField({ name: "category", type: "string", validation: Rule => Rule.required() }),
    defineField({ name: "approved", type: "boolean", initialValue: false, validation: Rule => Rule.required() }),
    defineField({ name: "availableForSubmissions", title: "Available for new submissions", type: "boolean", initialValue: false, validation: Rule => Rule.required() }),
  ],
});
