import { createApp, ref } from "vue";
import { Fachwerk } from "fachwerk";
import { parse as parseMarkdown } from "marked";
import { parse as parseSlides } from "@slidev/parser";
import { useStorage, onKeyStroke } from "@vueuse/core";

export async function createFachwerk(setup = {}) {
  const slides = await fetch("./slides.md").then((res) => res.text());
  const parsedSlides = parseSlides(slides).slides;

  const slidesTemplate = parsedSlides.map(
    (s, i) =>
      `<div
        class="
          prose md:prose-xl p-4 md:p-12 max-w-none min-h-screen 
          prose-code:px-1 prose-p:max-w-[70ch]
          prose-code:before:content-none prose-code:after:content-none
          ${s.frontmatter?.class}
        "
        style="${s.frontmatter?.style}"
        v-show="slide === ${i}"
      >
        ${parseMarkdown(s.content)}
      </div>`
  );

  const template = `
  ${slidesTemplate.join("\n\n")}
  <div class="fixed bottom-3 right-3 flex text-md transition-opacity opacity-100 md:opacity-10 hover:md:opacity-100 bg-white md:bg-transparent rounded md:rounded-none shadow md:shadow-none">
    <button class="px-2 outline-none" @click="onPrev">&lsaquo;</button>
    <button class="px-2 outline-none" @click="onNext">&rsaquo;</button>
  </div>
  `;

  const App = {
    setup() {
      const slide = useStorage("fachwerk_slide", 0);
      const next = () => {
        if (slide.value < parsedSlides.length - 1) slide.value++;
      };
      const prev = () => {
        if (slide.value > 0) slide.value--;
      };
      const goto = (title) => {
        const index = parsedSlides.findIndex(
          (s) => s.frontmatter?.title === title
        );
        if (index > -1) {
          slide.value = index;
        }
      };
      onKeyStroke("ArrowLeft", prev);
      onKeyStroke("ArrowRight", next);
      return { slide, next, prev, goto, ...setup };
    },
    template,
  };

  const app = createApp(App);
  app.use(Fachwerk);
  app.mount("#app");
}
