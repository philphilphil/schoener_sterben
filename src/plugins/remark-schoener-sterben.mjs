/**
 * Custom remark plugin for Schöner Sterben blog.
 *
 * Transforms remark-directive syntax (:::tldr, :::handlung, etc.)
 * and bare YouTube URLs into MDX JSX elements, auto-injecting the
 * necessary import statements.
 *
 * Requires remark-directive to run before this plugin.
 */

import { visit } from 'unist-util-visit';
import { parse } from 'acorn';

// Map of directive names to their Astro component info
const DIRECTIVE_COMPONENTS = {
  tldr: { component: 'TLDR', import: "import TLDR from '../../components/TLDR.astro';" },
  handlung: { component: 'Handlung', import: "import Handlung from '../../components/Handlung.astro';" },
  spoiler: { component: 'Spoiler', import: "import Spoiler from '../../components/Spoiler.astro';" },
  collapse: { component: 'Collapse', import: "import Collapse from '../../components/Collapse.astro';" },
  score: { component: 'Score', import: "import Score from '../../components/Score.astro';" },
};

const YOUTUBE_IMPORT = "import YouTube from '../../components/YouTube.astro';";

// Match YouTube URLs and extract video ID
const YOUTUBE_PATTERNS = [
  /^https?:\/\/(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]+)/,
  /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/,
];

function extractYouTubeId(url) {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

/**
 * Extract the label text from a directive node's children.
 * remark-directive stores labels as a paragraph child with data.directiveLabel = true.
 */
function extractLabel(node) {
  for (let i = 0; i < node.children.length; i++) {
    const child = node.children[i];
    if (child.data?.directiveLabel) {
      // Extract text content from the label paragraph
      const text = flattenText(child);
      node.children.splice(i, 1);
      return text;
    }
  }
  return null;
}

/** Recursively extract plain text from an AST node */
function flattenText(node) {
  if (node.type === 'text') return node.value;
  if (node.children) return node.children.map(flattenText).join('');
  return '';
}

/** Create an mdxJsxAttribute node */
function jsxAttr(name, value) {
  return { type: 'mdxJsxAttribute', name, value };
}

/** Create an mdxJsxAttributeValueExpression for JS expressions like {`...`} */
function jsxExprAttr(name, expression) {
  return {
    type: 'mdxJsxAttribute',
    name,
    value: {
      type: 'mdxJsxAttributeValueExpression',
      value: expression,
      data: {
        estree: parse(expression, { ecmaVersion: 2022, sourceType: 'module' }),
      },
    },
  };
}

/** Create an mdxjsEsm import node */
function makeImport(statement) {
  return {
    type: 'mdxjsEsm',
    value: statement,
    data: {
      estree: parse(statement, { ecmaVersion: 2022, sourceType: 'module' }),
    },
  };
}

/** Convert a container directive to an MDX JSX flow element (wrapper component) */
function transformWrapperDirective(node, componentName, propMapping) {
  const label = extractLabel(node);
  const attributes = [];

  if (label && propMapping) {
    attributes.push(jsxAttr(propMapping, label));
  }

  node.type = 'mdxJsxFlowElement';
  node.name = componentName;
  node.attributes = attributes;
  // children are kept as-is (the body content)
}

/** Convert a :::score directive to a self-closing <Score /> element */
function transformScoreDirective(node) {
  const label = extractLabel(node);

  // Collect all text content from body as the abc notation string
  const abcLines = [];
  for (const child of node.children) {
    abcLines.push(flattenText(child));
  }
  const abc = abcLines.join('\n');

  const attributes = [];
  if (label) {
    attributes.push(jsxAttr('title', label));
  }
  attributes.push(jsxExprAttr('abc', '`' + abc + '`'));

  node.type = 'mdxJsxFlowElement';
  node.name = 'Score';
  node.attributes = attributes;
  node.children = [];
}

/** Convert a paragraph containing only a YouTube URL into a <YouTube /> element */
function transformYouTubeParagraph(node) {
  // Check if paragraph has a single text child that is a YouTube URL
  if (node.children.length === 1 && node.children[0].type === 'text') {
    const text = node.children[0].value.trim();
    const videoId = extractYouTubeId(text);
    if (videoId) {
      node.type = 'mdxJsxFlowElement';
      node.name = 'YouTube';
      node.attributes = [jsxAttr('id', videoId)];
      node.children = [];
      return true;
    }
  }

  // Check if paragraph has a single link child that is a YouTube URL
  if (node.children.length === 1 && node.children[0].type === 'link') {
    const url = node.children[0].url;
    const videoId = extractYouTubeId(url);
    if (videoId) {
      node.type = 'mdxJsxFlowElement';
      node.name = 'YouTube';
      node.attributes = [jsxAttr('id', videoId)];
      node.children = [];
      return true;
    }
  }

  return false;
}

export function remarkSchoenerSterben() {
  return (tree) => {
    const usedImports = new Set();

    visit(tree, (node) => {
      // Handle container directives (:::name ... :::)
      if (node.type === 'containerDirective') {
        const directive = DIRECTIVE_COMPONENTS[node.name];
        if (!directive) return;

        usedImports.add(directive.import);

        if (node.name === 'score') {
          transformScoreDirective(node);
        } else if (node.name === 'tldr') {
          transformWrapperDirective(node, directive.component, null);
        } else if (node.name === 'handlung') {
          transformWrapperDirective(node, directive.component, 'title');
        } else if (node.name === 'spoiler') {
          transformWrapperDirective(node, directive.component, 'title');
        } else if (node.name === 'collapse') {
          transformWrapperDirective(node, directive.component, 'summary');
        }
      }

      // Handle paragraphs for YouTube URL detection
      if (node.type === 'paragraph') {
        if (transformYouTubeParagraph(node)) {
          usedImports.add(YOUTUBE_IMPORT);
        }
      }
    });

    // Prepend import statements for all used components
    const imports = Array.from(usedImports).map(makeImport);
    tree.children.unshift(...imports);
  };
}
