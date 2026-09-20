<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Prism from 'prismjs'
import 'prismjs/components/prism-typescript'

type ConsoleType = 'log' | 'error' | 'warn' | 'info'

type ConsoleEntry = {
  type: ConsoleType
  args: string[]
}

type SandboxMessage = {
  source?: string
  runId?: number
  type?: ConsoleType | 'ready'
  args?: unknown[]
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    packages?: Record<string, string>
    autorun?: boolean
  }>(),
  {
    modelValue: '',
    packages: () => ({}),
    autorun: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const code = ref(props.modelValue)
const output = ref<ConsoleEntry[]>([])
const iframe = ref<HTMLIFrameElement | null>(null)
const textarea = ref<HTMLTextAreaElement | null>(null)
const highlight = ref<HTMLElement | null>(null)
const running = ref(false)

let runTimer: ReturnType<typeof setTimeout> | undefined
let currentRunId = 0

let typescript: typeof import('typescript') | undefined

const importMap = computed(() => ({
  imports: Object.fromEntries(
    Object.entries(props.packages).map(([name, version]) => [
      name,
      `https://esm.sh/${name}@${version}`,
    ]),
  ),
}))

const highlightedCode = computed(() => {
  return Prism.highlight(code.value, Prism.languages.typescript, 'typescript')
})

async function getTypeScript() {
  if (!typescript) {
    typescript = await import('typescript')
  }

  return typescript
}

async function compile(source: string) {
  const ts = await getTypeScript()

  const result = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      strict: true,
    },
    reportDiagnostics: true,
  })

  const diagnostics =
    result.diagnostics
      ?.filter((diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error)
      .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')) ?? []

  if (diagnostics.length) {
    throw new Error(diagnostics.join('\n'))
  }

  return result.outputText
}

function serializeForHtml(value: unknown) {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
}

function escapeScriptContent(value: string) {
  const closingScriptStart = '<' + '/script'

  return value.replaceAll(closingScriptStart, '<' + '\\u002F' + 'script')
}

function syncScroll() {
  if (!textarea.value || !highlight.value) {
    return
  }

  highlight.value.scrollTop = textarea.value.scrollTop

  highlight.value.scrollLeft = textarea.value.scrollLeft
}

async function createSandbox(source: string, runId: number) {
  const compiled = await compile(source)
  const safeCode = escapeScriptContent(compiled)
  const serializedImportMap = serializeForHtml(importMap.value)

  const closeScript = '<' + '/script>'

  return [
    '<!doctype html>',
    '<html>',
    '<head>',
    '  <meta charset="utf-8">',
    '',
    '  <script type="importmap">',
    serializedImportMap,
    `  ${closeScript}`,
    '</head>',
    '',
    '<body>',
    '  <script>',
    `    const SOURCE = 'base-repl'`,
    `    const RUN_ID = ${runId}`,
    '',
    '    function serialize(value) {',
    `      if (typeof value === 'string') {`,
    '        return value',
    '      }',
    '',
    `      if (typeof value === 'undefined') {`,
    `        return 'undefined'`,
    '      }',
    '',
    `      if (typeof value === 'function') {`,
    '        return value.toString()',
    '      }',
    '',
    `      if (typeof value === 'bigint') {`,
    `        return value.toString() + 'n'`,
    '      }',
    '',
    '      if (value instanceof Error) {',
    '        return value.stack || value.message',
    '      }',
    '',
    '      try {',
    '        const result = JSON.stringify(value, null, 2)',
    '',
    `        return typeof result === 'undefined'`,
    '          ? String(value)',
    '          : result',
    '      } catch {',
    '        return String(value)',
    '      }',
    '    }',
    '',
    '    function send(type, args = []) {',
    '      parent.postMessage(',
    '        {',
    '          source: SOURCE,',
    '          runId: RUN_ID,',
    '          type,',
    '          args: args.map(serialize),',
    '        },',
    `        '*',`,
    '      )',
    '    }',
    '',
    `    console.log = (...args) => send('log', args)`,
    `    console.error = (...args) => send('error', args)`,
    `    console.warn = (...args) => send('warn', args)`,
    `    console.info = (...args) => send('info', args)`,
    '',
    '    window.addEventListener(',
    `      'error',`,
    '      event => {',
    `        send('error', [`,
    '          event.error?.stack ||',
    '          event.error?.message ||',
    '          event.message ||',
    `          'Unknown error',`,
    '        ])',
    '      },',
    '    )',
    '',
    '    window.addEventListener(',
    `      'unhandledrejection',`,
    '      event => {',
    `        send('error', [`,
    '          event.reason?.stack ||',
    '          event.reason?.message ||',
    '          event.reason ||',
    `          'Unhandled promise rejection',`,
    '        ])',
    '      },',
    '    )',
    '',
    `    send('ready')`,
    `  ${closeScript}`,
    '',
    '  <script type="module">',
    safeCode,
    `  ${closeScript}`,
    '</body>',
    '</html>',
  ].join('\n')
}

async function run() {
  window.clearTimeout(runTimer)

  output.value = []
  running.value = true

  await nextTick()

  if (!iframe.value) {
    running.value = false
    return
  }

  currentRunId += 1

  try {
    iframe.value.srcdoc = await createSandbox(code.value, currentRunId)
  } catch (error) {
    output.value.push({
      type: 'error',
      args: [error instanceof Error ? error.message : String(error)],
    })

    running.value = false
  }
}

function scheduleRun() {
  if (!props.autorun) {
    return
  }

  window.clearTimeout(runTimer)

  runTimer = window.setTimeout(() => {
    void run()
  }, 400)
}

function handleMessage(event: MessageEvent<SandboxMessage>) {
  if (event.source !== iframe.value?.contentWindow) {
    return
  }

  const message = event.data

  if (message?.source !== 'base-repl') {
    return
  }

  if (message.runId !== currentRunId) {
    return
  }

  if (message.type === 'ready') {
    return
  }

  if (
    message.type !== 'log' &&
    message.type !== 'error' &&
    message.type !== 'warn' &&
    message.type !== 'info'
  ) {
    return
  }

  output.value.push({
    type: message.type,
    args: Array.isArray(message.args) ? message.args.map(String) : [],
  })

  running.value = false
}

watch(
  () => props.modelValue,
  (value) => {
    if (value !== code.value) {
      code.value = value
    }
  },
)

watch(code, (value) => {
  emit('update:modelValue', value)
  scheduleRun()
})

watch(
  () => props.packages,
  () => {
    scheduleRun()
  },
  {
    deep: true,
  },
)

onMounted(() => {
  window.addEventListener('message', handleMessage)

  if (props.autorun) {
    void run()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)

  window.clearTimeout(runTimer)
})
</script>

<template>
  <div class="overflow-hidden border border-app-border bg-app-background">
    <div
      class="flex items-center justify-between border-b border-app-border bg-background-slight px-4 py-2.5"
    >
      <button
        type="button"
        class="inline-flex h-8 items-center justify-center bg-rose-dark px-3 text-xs font-semibold text-white transition-colors hover:bg-rose disabled:cursor-wait disabled:opacity-50 cursor-pointer w-25"
        :disabled="running"
        @click="run"
      >
        {{ running ? 'Running…' : 'Run' }}
      </button>
    </div>

    <div class="base-repl__layout">
      <section class="base-repl__editor" aria-label="TypeScript editor">
        <div
          class="pointer-events-none absolute right-3 top-3 z-10 bg-tag px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-app-text-muted"
        >
          TS
        </div>

        <pre
          ref="highlight"
          class="base-repl__highlight language-typescript"
          aria-hidden="true"
        ><code
          class="language-typescript"
          v-html="highlightedCode"
        /></pre>

        <textarea
          ref="textarea"
          v-model="code"
          class="base-repl__textarea"
          spellcheck="false"
          aria-label="REPL code"
          @scroll="syncScroll"
        />
      </section>

      <section class="base-repl__output">
        <div class="flex h-9 items-center border-b border-app-border px-4">
          <span class="text-[11px] font-semibold uppercase tracking-wider text-app-text-muted">
            Output
          </span>
        </div>

        <div class="base-repl__output-body">
          <div
            v-if="!output.length"
            class="flex h-full min-h-24 items-center justify-center text-sm text-app-text-muted"
          >
            {{ running ? 'Running…' : 'Run the example to see the output.' }}
          </div>

          <pre
            v-for="(entry, index) in output"
            :key="index"
            class="base-repl__entry"
            :data-type="entry.type"
          ><template
            v-for="(arg, argIndex) in entry.args"
            :key="argIndex"
          >{{ arg }}<template
            v-if="argIndex < entry.args.length - 1"
          > </template></template></pre>
        </div>
      </section>
    </div>

    <iframe ref="iframe" class="hidden" sandbox="allow-scripts" title="REPL sandbox" />
  </div>
</template>

<style scoped>
.base-repl__layout {
  display: grid;
  grid-template-columns:
    minmax(0, 1fr)
    minmax(0, 1fr);
  min-height: 320px;
}

.base-repl__editor {
  position: relative;
  min-width: 0;
  min-height: 320px;
  overflow: hidden;
  border-right: 1px solid var(--app-border);
  background: var(--code-background);
}

.base-repl__highlight,
.base-repl__textarea {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  min-height: 320px;
  margin: 0;
  padding: 1rem;
  border: 0;
  box-sizing: border-box;
  overflow: auto;

  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.65;
  tab-size: 2;
  white-space: pre;
}

.base-repl__highlight {
  z-index: 1;
  pointer-events: none;
  background: var(--code-background);
  color: var(--code-text);
}

.base-repl__highlight code {
  font: inherit;
  white-space: inherit;
}

.base-repl__textarea {
  z-index: 2;
  resize: none;
  outline: none;
  background: transparent;

  color: var(--code-text);
  caret-color: var(--app-rose);

  -webkit-text-fill-color: transparent;
}

.base-repl__textarea::selection {
  background: color-mix(in srgb, var(--app-rose) 22%, transparent);

  -webkit-text-fill-color: transparent;
}

.base-repl__textarea:focus {
  box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--app-rose) 40%, transparent);
}

.base-repl__output {
  min-width: 0;
  min-height: 320px;
  overflow: hidden;
  background: var(--app-background);
}

.base-repl__output-body {
  height: calc(100% - 2.25rem);
  min-height: 280px;
  overflow: auto;
  padding: 1rem;
}

.base-repl__entry {
  margin: 0 0 0.75rem;
  padding-left: 0.75rem;
  border-left: 2px solid var(--app-border);

  color: var(--app-text);
  white-space: pre-wrap;
  overflow-wrap: anywhere;

  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  line-height: 1.6;
}

.base-repl__entry:last-child {
  margin-bottom: 0;
}

.base-repl__entry[data-type='log'] {
  border-left-color: var(--app-green);
}

.base-repl__entry[data-type='info'] {
  border-left-color: var(--code-builtin);
}

.base-repl__entry[data-type='warn'] {
  border-left-color: var(--code-number);
}

.base-repl__entry[data-type='error'] {
  border-left-color: var(--app-rose);
  color: var(--app-rose);
}

@media (max-width: 720px) {
  .base-repl__layout {
    grid-template-columns: 1fr;
  }

  .base-repl__editor {
    border-right: 0;
    border-bottom: 1px solid var(--app-border);
  }

  .base-repl__editor,
  .base-repl__output {
    min-height: 280px;
  }
}
</style>
