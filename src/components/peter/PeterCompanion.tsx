import { CSSProperties, useEffect, useId, useRef } from 'react';
import { cn } from '@/lib/utils';
import { PeterAppearance, PeterEnvironment, PeterState, resolvePeterPresentation } from '@/lib/peter-presentation';
import styles from './peter-companion.module.css';

export interface PeterCompanionProps {
  state?: PeterState;
  size?: number;
  variant?: 'auto' | 'portrait' | 'figure';
  environment?: PeterEnvironment;
  appearance?: PeterAppearance;
  motion?: 'ambient' | 'still';
  className?: string;
  /** Omit for decorative artwork beside text. */
  label?: string;
}

/** One otter, one anatomy. Context changes the light and attention, never a costume. */
export function PeterCompanion({ state = 'neutral', size = 80, variant = 'auto', environment = 'none', appearance, motion = 'ambient', className, label }: PeterCompanionProps) {
  const id = `peter-${useId().replace(/:/g, '')}`;
  const ref = useRef<HTMLDivElement>(null);
  const portrait = variant === 'portrait' || (variant === 'auto' && size <= 64);
  const scene = resolvePeterPresentation(state, appearance);
  const moving = !portrait && motion === 'ambient' && scene.energy > 0;
  const fill = (name: string) => `url(#${id}-${name})`;

  useEffect(() => {
    const node = ref.current;
    if (!node || !moving) return;
    let visible = true;
    const update = () => { node.dataset.paused = String(!visible || document.hidden); };
    const observer = typeof IntersectionObserver === 'undefined' ? null : new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; update(); });
    observer?.observe(node);
    document.addEventListener('visibilitychange', update);
    update();
    return () => { observer?.disconnect(); document.removeEventListener('visibilitychange', update); };
  }, [moving]);

  return (
    <div ref={ref} className={cn(styles.companion, className)} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}
      data-peter-state={state} data-moving={moving} data-paused="false" data-variant={portrait ? 'portrait' : 'figure'}
      style={{ width: size, height: size, '--peter-energy': scene.energy, '--peter-pace': `${scene.pacingSeconds}s` } as CSSProperties}>
      <svg viewBox={portrait ? '46 32 148 148' : '0 0 240 280'} fill="none" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id={`${id}-coat`} x1="71" y1="60" x2="177" y2="230" gradientUnits="userSpaceOnUse">
            <stop stopColor="#BD9979"/><stop offset=".33" stopColor="#997456"/><stop offset=".7" stopColor="#755841"/><stop offset="1" stopColor="#514039"/>
          </linearGradient>
          <radialGradient id={`${id}-face`} cx=".37" cy=".26" r=".84">
            <stop stopColor="#C6A482"/><stop offset=".48" stopColor="#A17A57"/><stop offset=".83" stopColor="#765840"/><stop offset="1" stopColor="#57463B"/>
          </radialGradient>
          <linearGradient id={`${id}-cream`} x1="94" y1="99" x2="145" y2="144" gradientUnits="userSpaceOnUse">
            <stop stopColor="#F1DEC2"/><stop offset=".6" stopColor="#D9BF9C"/><stop offset="1" stopColor="#B29375"/>
          </linearGradient>
          <linearGradient id={`${id}-chest`} x1="98" y1="129" x2="143" y2="234" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D9BD96"/><stop offset=".55" stopColor="#BD9A73"/><stop offset="1" stopColor="#8B694E" stopOpacity=".25"/>
          </linearGradient>
          <linearGradient id={`${id}-tail`} x1="152" y1="218" x2="227" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#866448"/><stop offset=".6" stopColor="#60493C"/><stop offset="1" stopColor="#403337"/>
          </linearGradient>
          <linearGradient id={`${id}-rim`} x1="65" y1="50" x2="167" y2="253" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--peter-rim)" stopOpacity=".8"/><stop offset=".47" stopColor="#E97868" stopOpacity=".18"/><stop offset="1" stopColor="#4B2E57" stopOpacity=".28"/>
          </linearGradient>
          <radialGradient id={`${id}-warm`}><stop stopColor="#F3B55A" stopOpacity={.05 + scene.warmth * .1}/><stop offset="1" stopColor="#E97868" stopOpacity="0"/></radialGradient>
          <radialGradient id={`${id}-depth`}><stop stopColor="#4B2E57" stopOpacity=".09"/><stop offset="1" stopColor="#4B2E57" stopOpacity="0"/></radialGradient>
          <radialGradient id={`${id}-shadow`}><stop stopColor="#49383C" stopOpacity=".16"/><stop offset="1" stopColor="#49383C" stopOpacity="0"/></radialGradient>
          <linearGradient id={`${id}-thread`}><stop stopColor="#4B2E57" stopOpacity=".04"/><stop offset=".5" stopColor="#E97868" stopOpacity=".3"/><stop offset="1" stopColor="#F3B55A" stopOpacity=".08"/></linearGradient>
          {portrait && <>
            <linearGradient id={`${id}-portrait-fade`} x1="0" y1="140" x2="0" y2="176" gradientUnits="userSpaceOnUse"><stop stopColor="white"/><stop offset="1" stopColor="black"/></linearGradient>
            <mask id={`${id}-portrait-mask`}><rect width="240" height="280" fill={fill('portrait-fade')}/></mask>
          </>}
        </defs>
        {!portrait && <>
          <g className={styles.atmosphere}>
            <ellipse cx="119" cy="150" rx="115" ry="121" fill={fill('warm')}/>
            <ellipse cx="155" cy="186" rx="80" ry="77" fill={fill('depth')}/>
            <g opacity={scene.complexity} stroke={fill('thread')} strokeWidth="1">
              {environment === 'bridge' && <><path d="M12 160C56 112 83 121 119 164S189 204 231 148"/><path d="M10 169C57 123 83 131 118 171S190 211 232 157"/></>}
              {environment === 'bloom' && <><path d="M121 251C36 222 15 138 54 92C70 159 120 167 121 251Z" fill={fill('warm')}/><path d="M122 251C198 208 226 121 197 80C181 148 133 180 122 251Z" fill={fill('warm')}/></>}
              {environment === 'flow' && <><path d="M10 226C73 208 120 244 229 219"/><path d="M10 234C75 219 141 254 229 229"/></>}
            </g>
          </g>
          <ellipse cx="131" cy="263" rx="101" ry="11" fill={fill('shadow')}/>
        </>}
        <g className={styles.body} mask={portrait ? fill('portrait-mask') : undefined}>
          {/* A tapering river-otter tail, resting behind the body. */}
          <path d="M151 207C176 216 173 238 192 246C203 251 221 253 232 248C227 262 207 270 188 264C161 257 149 239 140 227Z" fill={fill('tail')}/>
          <path d="M177 240C191 256 214 260 232 248" stroke={fill('rim')} strokeWidth="1.2"/>
          {/* Long pear-shaped torso, a low centre of gravity, and small webbed feet. */}
          <path d="M91 117C80 130 75 151 69 180C62 209 64 237 80 250C93 261 142 266 164 250C186 233 180 202 170 176C162 153 157 128 146 117Z" fill={fill('coat')}/>
          <path d="M99 124C91 153 89 194 96 222C101 246 141 247 148 222C155 197 150 151 140 124Z" fill={fill('chest')}/>
          <path d="M73 235C66 241 62 248 65 253C72 260 92 261 102 254C105 250 99 243 95 242Z" fill="#6D513E"/>
          <path d="M145 241C154 235 166 238 173 247C179 255 166 260 148 258C138 257 137 247 145 241Z" fill="#654C3D"/>
          <g stroke="#C1A17F" strokeWidth=".85" opacity=".5" strokeLinecap="round"><path d="M73 250L80 252M81 248L88 252M153 253L155 248M161 254L163 249"/></g>
          {/* Resting paw positions are part of the pose, never a wave or a loop. */}
          <g transform={`translate(0 ${scene.pawY}) rotate(${scene.leftPaw} 83 148)`}>
            <path d="M83 148C72 157 73 175 88 184L109 194C117 197 123 190 119 184C114 177 98 175 96 165" fill={fill('coat')}/>
            <path d="M101 180C108 181 115 183 119 187" stroke="#D6B48C" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round"/>
          </g>
          <g transform={`translate(0 ${scene.pawY}) rotate(${scene.rightPaw} 153 147)`}>
            <path d="M153 147C166 159 165 177 150 187L135 195C126 199 120 192 125 184C132 176 142 174 142 164" fill={fill('coat')}/>
            <path d="M133 183C129 185 126 188 126 191" stroke="#D6B48C" strokeOpacity=".35" strokeWidth="1.2" strokeLinecap="round"/>
          </g>
          <path d="M83 142C73 163 66 197 68 218" stroke={fill('rim')} strokeWidth="1.4"/>
          <g transform={`translate(0 ${scene.headY}) rotate(${scene.tilt} 120 124)`}>
            {/* Small ears sit at the side of the broad, gently flattened head. */}
            <path d="M72 61C62 54 54 61 58 73L66 84L79 74Z" fill="#805F47"/>
            <path d="M164 59C175 52 183 61 179 74L172 84L158 73Z" fill="#765741"/>
            <path d="M66 63C62 62 62 68 66 73M170 62C175 61 175 69 171 73" stroke="#C19A78" strokeWidth="3" strokeLinecap="round"/>
            <path d="M62 96C59 79 66 64 82 55C98 45 119 44 138 48C160 51 175 62 180 80C187 100 176 120 159 130C144 139 125 144 105 137C83 131 65 115 62 96Z" fill={fill('face')}/>
            <path d="M65 87C64 71 83 53 105 50C124 47 145 52 159 59" stroke={fill('rim')} strokeWidth="1.5" strokeLinecap="round"/>
            {/* Low contrast swept coat contours suggest fur without a texture filter. */}
            <g stroke="#E2C5A0" strokeOpacity=".14" strokeWidth=".7" strokeLinecap="round">
              <path d="M74 75C82 63 97 58 108 57M72 83C79 74 88 69 97 68M143 59C155 65 162 72 165 80M75 98L79 103M162 108L168 102M83 122L91 126"/>
            </g>
            <path d="M78 100C84 91 97 92 110 100C116 103 124 103 131 99C145 92 159 94 165 104C173 119 153 137 130 139C107 142 83 132 77 119C74 112 74 106 78 100Z" fill={fill('cream')}/>
            {/* Eye contours change, not merely their scale or surrounding light. */}
            {scene.eyeStyle === 'open' ? <g transform={`translate(${scene.gaze} ${scene.gazeY})`}>
              <g transform={`translate(92 91) scale(1 ${scene.eyes}) translate(-92 -91)`}>
                <path d="M83 91C87 85 95 85 100 91C95 97 87 97 83 91Z" fill="#33291F"/><ellipse cx="91" cy="90.5" rx="4" ry="4.3" fill="#211D1B"/><circle cx="89.8" cy="89" r="1.1" fill="#F7E5CC" opacity=".85"/>
              </g>
              <g transform={`translate(150 91) scale(1 ${scene.rightEye}) translate(-150 -91)`}>
                <path d="M140 91C145 85 154 85 158 91C154 97 145 97 140 91Z" fill="#33291F"/><ellipse cx="149.3" cy="90.5" rx="4" ry="4.3" fill="#211D1B"/><circle cx="148.1" cy="89" r="1.1" fill="#F7E5CC" opacity=".85"/>
              </g>
            </g> : <path
              d={scene.eyeStyle === 'resting' ? 'M83 91Q91 98 100 91M140 91Q149 98 158 91' : 'M82 94Q91 83 101 93M140 93Q150 83 159 94'}
              stroke="#3B2C22" strokeWidth="2.6" strokeLinecap="round"/>
            }
            <path d={scene.brows} stroke="#654C38" strokeOpacity=".65" strokeWidth="1.7" strokeLinecap="round"/>
            {/* Broad whisker pads and a soft triangular nose are Peter's anchor. */}
            <path d="M106 106C110 101 129 101 134 105C136 108 127 116 121 116C115 116 105 110 106 106Z" fill="#3E3029"/>
            <path d="M111 106C116 104 124 104 129 106" stroke="#AC8E77" strokeWidth="1" strokeOpacity=".55" strokeLinecap="round"/>
            <path d={scene.mouth} stroke="#654A36" strokeWidth="1.8" strokeLinecap="round"/>
            <path d="M114 132C120 134 129 133 133 131" stroke="#F2DEC0" strokeOpacity=".55" strokeWidth="1.2" strokeLinecap="round"/>
            <g stroke="#6C5443" strokeWidth=".9" strokeLinecap="round" opacity=".48">
              <path d="M99 110C88 106 76 104 66 105M99 116C87 113 73 114 62 117M100 121C88 120 76 123 68 127M141 110C151 106 164 103 174 104M142 116C155 112 168 113 179 115M141 121C152 119 167 122 175 126"/>
            </g>
            <g fill="#87694E" opacity=".4"><circle cx="102" cy="109" r=".7"/><circle cx="97" cy="114" r=".7"/><circle cx="104" cy="118" r=".7"/><circle cx="139" cy="109" r=".7"/><circle cx="144" cy="114" r=".7"/><circle cx="138" cy="119" r=".7"/></g>
          </g>
        </g>
      </svg>
    </div>
  );
}
