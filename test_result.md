#====================================================================================================
# START - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================

# THIS SECTION CONTAINS CRITICAL TESTING INSTRUCTIONS FOR BOTH AGENTS
# BOTH MAIN_AGENT AND TESTING_AGENT MUST PRESERVE THIS ENTIRE BLOCK

# Communication Protocol:
# If the `testing_agent` is available, main agent should delegate all testing tasks to it.
#
# You have access to a file called `test_result.md`. This file contains the complete testing state
# and history, and is the primary means of communication between main and the testing agent.
#
# Main and testing agents must follow this exact format to maintain testing data. 
# The testing data must be entered in yaml format Below is the data structure:
# 
## user_problem_statement: {problem_statement}
## backend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.py"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## frontend:
##   - task: "Task name"
##     implemented: true
##     working: true  # or false or "NA"
##     file: "file_path.js"
##     stuck_count: 0
##     priority: "high"  # or "medium" or "low"
##     needs_retesting: false
##     status_history:
##         -working: true  # or false or "NA"
##         -agent: "main"  # or "testing" or "user"
##         -comment: "Detailed comment about status"
##
## metadata:
##   created_by: "main_agent"
##   version: "1.0"
##   test_sequence: 0
##   run_ui: false
##
## test_plan:
##   current_focus:
##     - "Task name 1"
##     - "Task name 2"
##   stuck_tasks:
##     - "Task name with persistent issues"
##   test_all: false
##   test_priority: "high_first"  # or "sequential" or "stuck_first"
##
## agent_communication:
##     -agent: "main"  # or "testing" or "user"
##     -message: "Communication message between agents"

# Protocol Guidelines for Main agent
#
# 1. Update Test Result File Before Testing:
#    - Main agent must always update the `test_result.md` file before calling the testing agent
#    - Add implementation details to the status_history
#    - Set `needs_retesting` to true for tasks that need testing
#    - Update the `test_plan` section to guide testing priorities
#    - Add a message to `agent_communication` explaining what you've done
#
# 2. Incorporate User Feedback:
#    - When a user provides feedback that something is or isn't working, add this information to the relevant task's status_history
#    - Update the working status based on user feedback
#    - If a user reports an issue with a task that was marked as working, increment the stuck_count
#    - Whenever user reports issue in the app, if we have testing agent and task_result.md file so find the appropriate task for that and append in status_history of that task to contain the user concern and problem as well 
#
# 3. Track Stuck Tasks:
#    - Monitor which tasks have high stuck_count values or where you are fixing same issue again and again, analyze that when you read task_result.md
#    - For persistent issues, use websearch tool to find solutions
#    - Pay special attention to tasks in the stuck_tasks list
#    - When you fix an issue with a stuck task, don't reset the stuck_count until the testing agent confirms it's working
#
# 4. Provide Context to Testing Agent:
#    - When calling the testing agent, provide clear instructions about:
#      - Which tasks need testing (reference the test_plan)
#      - Any authentication details or configuration needed
#      - Specific test scenarios to focus on
#      - Any known issues or edge cases to verify
#
# 5. Call the testing agent with specific instructions referring to test_result.md
#
# IMPORTANT: Main agent must ALWAYS update test_result.md BEFORE calling the testing agent, as it relies on this file to understand what to test next.

#====================================================================================================
# END - Testing Protocol - DO NOT EDIT OR REMOVE THIS SECTION
#====================================================================================================



#====================================================================================================
# Testing Data - Main Agent and testing sub agent both should log testing data below this section
#====================================================================================================

frontend:
  - task: "Correção do mini site público (cores/contraste/vídeo/áudio) + formulário de mídia (remover logomarca, crop) + pt-BR"
    implemented: true
    working: "NA"
    file: "frontend/src/components/CardTemplate.jsx, frontend/src/pages/Admin.jsx, frontend/src/components/ImageCropDialog.jsx, frontend/src/lib/themeContrast.js, frontend/src/lib/imageCrop.js, frontend/src/pages/PublicCard.jsx, frontend/src/index.css"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "1) Botão único reutilizável (ActionButton + classe .dc-action): TODOS os botões usam corBotoes no fundo/borda/hover/foco. 2) Contraste automático (themeContrast.js: luminância WCAG) escolhe texto/ícone claro/escuro para botões E textos do card conforme corFundo/corBotoes. 3) Vídeo de cabeçalho object-contain com detecção portrait/landscape (altura responsiva, sem cortar/deformar). 4) Botão de som (card-video-sound-toggle) alterna mudo/som e ícone; autoplay muted mantido. 5) Logomarca removida do form, template e PublicCard (profile/header preservados). 6) Foto de perfil circular (rounded-full, aspect-square, object-cover) ABAIXO da mídia com espaçamento, sem sobrepor. 7) Crop/zoom/reposição (react-easy-crop) antes de enviar foto de perfil (1:1) e capa (3:2); imagem já enquadrada é enviada ao endpoint existente (sem mudança de DB). 8) Nome exibido sem transformação. Testar as 3 combinações de contraste."
  - task: "QR Code do mini site na lista de clientes (aba Clientes)"
    implemented: true
    working: "NA"
    file: "frontend/src/pages/Admin.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Ação 'QR Code' por cliente. Habilitada só para Publicado (abre modal com nome, QR gerado no frontend via lib 'qrcode', URL pública window.location.origin + /c/slug, botões Baixar PNG / Copiar link / Fechar; download com nome qrcode-{slug}.png). Para Rascunho: botão desabilitado com title 'Publique o cliente para gerar o QR Code'. Sem endpoint novo, sem alteração de modelo/DB. Nenhum dado pessoal no QR, apenas a URL."
  - task: "Busca e filtros na lista de clientes (aba Clientes)"
    implemented: true
    working: "NA"
    file: "frontend/src/pages/Admin.jsx"
    stuck_count: 0
    priority: "high"
    needs_retesting: true
    status_history:
        -working: "NA"
        -agent: "main"
        -comment: "Adicionada barra de busca (por nome ou slug), filtro por status (Todos/Publicado/Rascunho), botão Limpar (aparece só com filtro ativo), contador 'Mostrando X de Y clientes' e estado vazio específico para filtro sem resultados. Overview KPIs continuam usando a lista completa (totais reais inalterados). Apenas a aba Clientes foi alterada."

metadata:
  created_by: "main_agent"
  version: "1.1"
  test_sequence: 1
  run_ui: true

test_plan:
  current_focus:
    - "Busca e filtros na lista de clientes (aba Clientes)"
  stuck_tasks: []
  test_all: false
  test_priority: "high_first"

agent_communication:
    -agent: "main"
    -message: "Repositório importado (branch main), .env restaurado (JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, EMERGENT_LLM_KEY). 32 testes pytest passam. Implementei somente busca+filtros na aba Clientes. Testar via UI a matriz completa."
