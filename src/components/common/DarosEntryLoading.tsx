import logoIcon from '../../assets/daros-logo-icon.png';
import {
  DarosEntryLoadingIcon,
  DarosEntryLoadingIconWrap,
  DarosEntryLoadingRing,
  DarosEntryLoadingRoot,
} from './DarosEntryLoading.styles';

export function DarosEntryLoading() {
  return (
    <DarosEntryLoadingRoot aria-live="polite" aria-busy="true">
      <DarosEntryLoadingIconWrap>
        <DarosEntryLoadingRing aria-hidden="true" />
        <DarosEntryLoadingRing $delay aria-hidden="true" />
        <DarosEntryLoadingIcon src={logoIcon} alt="" />
      </DarosEntryLoadingIconWrap>
    </DarosEntryLoadingRoot>
  );
}
