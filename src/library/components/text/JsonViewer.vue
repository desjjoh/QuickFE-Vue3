<template>
  <FlexBox direction="column" :gap="1" class="json-viewer">
    <BlockText v-if="title" element="h6" weight="semibold">{{ $t(title) }}</BlockText>
    <div class="json-viewer__code-block">
      <pre><code v-html="html"></code></pre>
    </div>
  </FlexBox>
</template>

<script setup lang="ts">
import FlexBox from '@/library/components/flex/FlexBox.vue'
import BlockText from './BlockText.vue'
import { useJsonViewer } from '@/shared/hooks/useJsonViewer'

const props = withDefaults(
  defineProps<{ item: unknown; title?: string; indentSize?: number; maxStringLength?: number }>(),
  {
    indentSize: 2,
    maxStringLength: 500,
  },
)

const { html } = useJsonViewer(
  () => props.item,
  () => ({ indentSize: props.indentSize, maxStringLength: props.maxStringLength }),
)
</script>

<style scoped lang="scss">
.json-viewer {
  min-width: 0;
}

.json-viewer__code-block {
  min-width: 0;
  padding: space(4);

  border-radius: border-radius(md);
  background: color(control, input-bg);
  box-shadow: box-shadow(0);

  pre {
    margin: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: pre;
  }

  code {
    font-family: font-family(code);
    font-size: font-size(sm);
    line-height: prose-line-height(base);
    color: color(text, primary);
  }

  :deep(.pd-key) {
    color: palette-color(blue, 11);
    font-weight: font-weight(semibold);
  }

  :deep(.pd-string) {
    color: palette-color(lime, 11);
  }

  :deep(.pd-number) {
    color: palette-color(amber, 11);
  }

  :deep(.pd-boolean) {
    color: palette-color(ruby, 11);
  }

  :deep(.pd-null) {
    color: palette-color(iris, 11);
  }

  :deep(.pd-empty),
  :deep(.pd-colon),
  :deep(.pd-bracket),
  :deep(.pd-bullet) {
    color: color(text, tertiary);
  }
}
</style>
