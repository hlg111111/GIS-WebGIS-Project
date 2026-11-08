import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)));
const skillDir = 'C:/Users/ASUS/.codex/plugins/cache/openai-primary-runtime/presentations/26.1030.10813/skills/presentations';
const { finalizePresentation } = await import(pathToFileURL(path.join(skillDir, 'container_tools/artifact_tool_utils.mjs')).href);
const workspaceDir = 'C:/Users/ASUS/Documents/Codex';
const candidatePath = path.join(root, '.ppt-build', 'defense-deck-draft.pptx');
const finalPath = path.join(root, 'slides', '答辩PPT.pptx');
const stagingDir = path.join(root, '.codex-finalizer');
const result = await finalizePresentation({
  explicitTotalSlideCount: 7,
  workspaceDir,
  candidatePath,
  finalPath,
  pythonExecutable: 'C:/Users/ASUS/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe',
  integrityValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_package_integrity.py'),
  layoutValidatorPath: path.join(skillDir, 'container_tools/inspect_presentation_layout_geometry.py'),
  layoutArgs: ['--expected-slide-size-emu', '12192000,6858000', '--validate-bullet-geometry', '--validate-heading-fit'],
  requiredNativeTableOwnerSlides: [],
  fontPolicy: { basis: 'design', families: ['Microsoft YaHei'] },
  verifyArtifactToolImport: true,
  receiptPath: path.join(stagingDir, '答辩PPT.pptx.validation.json')
});
console.log(JSON.stringify(result, null, 2));

