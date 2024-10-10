import type { FC } from 'react';
import type { AggregationColor } from '../color';
import type { PresetsItem } from '../interface';
interface ColorPresetsProps {
    prefixCls: string;
    presets: PresetsItem[];
    value?: AggregationColor;
    onChange?: (value: AggregationColor) => void;
}
declare const ColorPresets: FC<ColorPresetsProps>;
export default ColorPresets;
