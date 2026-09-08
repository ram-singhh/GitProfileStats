import {
  svgDocument,
  icon,
  estimateTextWidth,
  renderTypography,
  resolveThemeWithOptions,
  computeLayout,
  renderLayout,
  type ContainerNode,
  type LayoutNode,
  type IconName,
  type CardOptions,
} from './engine/index.js';

export interface IGitHubStatsData {
  username: string;
  name: string | null;
  totalStars: number;
  totalCommits: number;
  totalRepositories: number;
  pullRequests: number;
  issues: number;
  followers: number;
}

/**
 * Adjusts a hex color by lightening or darkening it, depending on whether it is light or dark.
 */
function adjustColor(hex: string, percent: number): string {
  hex = hex.replace(/^\s*#|\s*$/g, '');
  if (hex.length === 3) {
    hex = hex.replace(/(.)/g, '$1$1');
  }
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);

  // Determine if dark or light color
  const isDark = (r * 299 + g * 587 + b * 114) / 1000 < 128;
  const amount = isDark ? percent : -percent;

  r = Math.min(255, Math.max(0, r + amount));
  g = Math.min(255, Math.max(0, g + amount));
  b = Math.min(255, Math.max(0, b + amount));

  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');

  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Creates a layout node for a single statistic item (icon + label + value).
 */
function createStatRow(iconName: IconName, label: string, value: number | string): LayoutNode {
  const valueStr = typeof value === 'number' ? value.toLocaleString() : value;
  return {
    type: 'row',
    width: 'fill',
    alignItems: 'center',
    justifyContent: 'space-between',
    style: {
      className: 'stat-row',
    },
    children: [
      {
        type: 'row',
        spacing: 8,
        alignItems: 'center',
        children: [
          {
            type: 'leaf',
            width: 16,
            height: 16,
            render: (x: number, y: number, w: number, _h: number) =>
              icon({
                name: iconName,
                x,
                y,
                size: w,
                fill: 'var(--color-accent)',
              }),
          },
          {
            type: 'leaf',
            width: 'auto',
            height: 'auto',
            measure: () => ({
              width: estimateTextWidth(label, 13),
              height: 14,
            }),
            render: (x: number, y: number, _w: number, _h: number) =>
              renderTypography(
                {
                  x,
                  y,
                  text: label,
                  dominantBaseline: 'hanging',
                  maxWidth: 125,
                },
                13,
                500,
                'var(--color-text-muted)',
              ),
          },
        ],
      },
      {
        type: 'leaf',
        width: 'auto',
        height: 'auto',
        measure: () => ({
          width: estimateTextWidth(valueStr, 13),
          height: 14,
        }),
        render: (x: number, y: number, w: number, _h: number) =>
          renderTypography(
            {
              x: x + w,
              y,
              text: valueStr,
              textAnchor: 'end',
              dominantBaseline: 'hanging',
            },
            13,
            700,
            'var(--color-text)',
          ),
      },
    ],
  };
}

/**
 * Renders a full GitHub Stats Card as an SVG string.
 */
export function renderStatsCard(stats: IGitHubStatsData, options?: CardOptions): string {
  const resolvedTheme = resolveThemeWithOptions(options);
  const titleText = `${stats.name ?? stats.username}'s GitHub Stats`;

  // Build layout tree (440x195)
  const rootNode: ContainerNode = {
    type: 'column',
    width: 440,
    height: 195,
    padding: 20,
    spacing: 16,
    justifyContent: 'center',
    style: {
      rx: options?.borderRadius !== undefined ? options.borderRadius : 10,
      ry: options?.borderRadius !== undefined ? options.borderRadius : 10,
      fill: 'url(#card-bg-gradient)',
      stroke: options?.hideBorder ? 'none' : 'var(--color-border)',
      strokeWidth: options?.hideBorder ? 0 : 1,
      className: 'stats-card',
    },
    children: [
      // Title Row
      {
        type: 'row',
        width: 'fill',
        spacing: 8,
        alignItems: 'center',
        children: [
          {
            type: 'leaf',
            width: 20,
            height: 20,
            render: (x: number, y: number, w: number, _h: number) =>
              icon({
                name: 'repo',
                x,
                y,
                size: w,
                fill: 'var(--color-accent)',
              }),
          },
          {
            type: 'leaf',
            width: 'auto',
            height: 'auto',
            measure: () => ({
              width: estimateTextWidth(titleText, 16),
              height: 18,
            }),
            render: (x: number, y: number, _w: number, _h: number) =>
              renderTypography(
                {
                  x,
                  y,
                  text: titleText,
                  dominantBaseline: 'hanging',
                  maxWidth: 370,
                },
                16,
                700,
                'var(--color-accent)',
              ),
          },
        ],
      },
      // Stats Columns (side by side)
      {
        type: 'row',
        width: 'fill',
        spacing: 20,
        children: [
          {
            type: 'column',
            width: 'fill',
            spacing: 12,
            children: [
              createStatRow('star', 'Total Stars:', stats.totalStars),
              createStatRow('commit', 'Total Commits:', stats.totalCommits),
              createStatRow('repo', 'Total Repositories:', stats.totalRepositories),
            ],
          },
          {
            type: 'column',
            width: 'fill',
            spacing: 12,
            children: [
              createStatRow('pullRequest', 'Pull Requests:', stats.pullRequests),
              createStatRow('issue', 'Issues:', stats.issues),
              createStatRow('followers', 'Followers:', stats.followers),
            ],
          },
        ],
      },
    ],
  };

  // Compute and Render layout
  const computed = computeLayout(rootNode, 440, 195);
  const layoutContent = renderLayout(computed);

  // Gradient definitions using adjusted background colors
  const stopColor = adjustColor(resolvedTheme.background, 12);
  const defs = `
  <defs>
    <linearGradient id="card-bg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${resolvedTheme.background}" />
      <stop offset="100%" stop-color="${stopColor}" />
    </linearGradient>
  </defs>
  `;

  // Custom premium CSS styles
  const customStyles = `
    .stats-card {
      filter: drop-shadow(0px 4px 12px rgba(0, 0, 0, 0.15));
      transition: transform 0.3s ease, filter 0.3s ease;
    }
    .stat-row {
      transition: transform 0.2s ease;
    }
    .stat-row:hover {
      transform: translateX(4px);
    }
  `;

  return svgDocument(
    {
      width: 440,
      height: 195,
      theme: resolvedTheme,
      customStyles,
    },
    [defs, layoutContent],
  );
}
