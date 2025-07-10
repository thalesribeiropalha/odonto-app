const { spawn } = require('child_process');
const path = require('path');

// Cores para output no terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const testScripts = [
  {
    name: 'CRUD de Pacientes',
    file: 'test-patients-crud.js',
    description: 'Testa todas as operações CRUD de pacientes'
  },
  {
    name: 'CRUD de Usuários',
    file: 'test-users-crud.js',
    description: 'Testa todas as operações CRUD de usuários'
  },
  {
    name: 'CRUD de Organizações',
    file: 'test-organizations-crud.js',
    description: 'Testa todas as operações CRUD de organizações'
  },
  {
    name: 'Testes de Integração',
    file: 'test-integration-suite.js',
    description: 'Testa integração entre entidades e cenários complexos'
  }
];

async function runScript(scriptPath, scriptName) {
  return new Promise((resolve) => {
    console.log(`${colors.cyan}${colors.bright}🚀 Executando: ${scriptName}${colors.reset}`);
    console.log(`${colors.blue}📁 Arquivo: ${scriptPath}${colors.reset}\n`);
    
    const startTime = Date.now();
    const child = spawn('node', [scriptPath], { 
      stdio: 'inherit',
      shell: true 
    });
    
    child.on('close', (code) => {
      const endTime = Date.now();
      const executionTime = endTime - startTime;
      
      if (code === 0) {
        console.log(`\n${colors.green}✅ ${scriptName} concluído com sucesso!${colors.reset}`);
        console.log(`${colors.blue}⏱️  Tempo de execução: ${executionTime}ms${colors.reset}\n`);
        resolve({ success: true, executionTime, name: scriptName });
      } else {
        console.log(`\n${colors.red}❌ ${scriptName} falhou (código ${code})${colors.reset}`);
        console.log(`${colors.blue}⏱️  Tempo de execução: ${executionTime}ms${colors.reset}\n`);
        resolve({ success: false, executionTime, name: scriptName });
      }
      
      console.log(`${colors.yellow}${'='.repeat(80)}${colors.reset}\n`);
    });
    
    child.on('error', (error) => {
      console.error(`${colors.red}❌ Erro ao executar ${scriptName}: ${error.message}${colors.reset}\n`);
      resolve({ success: false, executionTime: 0, name: scriptName, error: error.message });
    });
  });
}

async function checkServerStatus() {
  const axios = require('axios');
  try {
    const response = await axios.get('http://localhost:3002/api/status', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

async function runAllTests() {
  console.log(`${colors.magenta}${colors.bright}`);
  console.log('🧪 EXECUTANDO SUITE COMPLETA DE TESTES DE QUALIDADE');
  console.log('📊 Validação de CRUD para Pacientes, Usuários e Organizações');
  console.log('=' .repeat(80));
  console.log(`${colors.reset}\n`);
  
  // Verificar se o servidor está rodando
  console.log(`${colors.yellow}🔍 Verificando status do servidor...${colors.reset}`);
  const serverRunning = await checkServerStatus();
  
  if (!serverRunning) {
    console.log(`${colors.red}❌ ERRO: Servidor não está respondendo em http://localhost:3002${colors.reset}`);
    console.log(`${colors.yellow}💡 SOLUÇÃO: Execute 'cd backend && npm run dev' em outro terminal${colors.reset}\n`);
    process.exit(1);
  }
  
  console.log(`${colors.green}✅ Servidor está rodando e respondendo${colors.reset}\n`);
  console.log(`${colors.yellow}${'='.repeat(80)}${colors.reset}\n`);
  
  const results = [];
  const overallStartTime = Date.now();
  
  // Executar cada script de teste
  for (const script of testScripts) {
    try {
      const result = await runScript(script.file, script.name);
      results.push({ ...result, description: script.description });
    } catch (error) {
      console.error(`${colors.red}❌ Erro crítico ao executar ${script.name}: ${error.message}${colors.reset}\n`);
      results.push({ 
        success: false, 
        executionTime: 0, 
        name: script.name, 
        description: script.description,
        error: error.message 
      });
    }
  }
  
  const overallEndTime = Date.now();
  const totalExecutionTime = overallEndTime - overallStartTime;
  
  // Relatório final
  console.log(`${colors.magenta}${colors.bright}`);
  console.log('📊 RELATÓRIO FINAL DE QUALIDADE');
  console.log('=' .repeat(80));
  console.log(`${colors.reset}\n`);
  
  const successfulTests = results.filter(r => r.success).length;
  const totalTests = results.length;
  
  console.log(`${colors.bright}🎯 RESULTADO GERAL: ${successfulTests}/${totalTests} grupos de testes passaram${colors.reset}\n`);
  
  // Detalhes por teste
  console.log(`${colors.cyan}📋 DETALHES POR CATEGORIA:${colors.reset}`);
  results.forEach((result, index) => {
    const status = result.success ? `${colors.green}✅` : `${colors.red}❌`;
    const time = `${colors.blue}(${result.executionTime}ms)${colors.reset}`;
    console.log(`${status} ${result.name} ${time}`);
    console.log(`   ${colors.yellow}${result.description}${colors.reset}`);
    if (result.error) {
      console.log(`   ${colors.red}Erro: ${result.error}${colors.reset}`);
    }
    console.log();
  });
  
  // Estatísticas
  console.log(`${colors.cyan}📈 ESTATÍSTICAS:${colors.reset}`);
  console.log(`   ${colors.blue}⏱️  Tempo total de execução: ${totalExecutionTime}ms (${(totalExecutionTime/1000).toFixed(1)}s)${colors.reset}`);
  console.log(`   ${colors.blue}⚡ Tempo médio por teste: ${(totalExecutionTime/totalTests).toFixed(0)}ms${colors.reset}`);
  console.log(`   ${colors.blue}📊 Taxa de sucesso: ${((successfulTests/totalTests)*100).toFixed(1)}%${colors.reset}\n`);
  
  // Resultado final
  if (successfulTests === totalTests) {
    console.log(`${colors.green}${colors.bright}🎉 TODOS OS TESTES PASSARAM!${colors.reset}`);
    console.log(`${colors.green}✨ O sistema está funcionando corretamente em todas as áreas testadas.${colors.reset}`);
    console.log(`${colors.green}🏆 Qualidade do código: EXCELENTE${colors.reset}\n`);
  } else {
    console.log(`${colors.yellow}⚠️  ALGUNS TESTES FALHARAM${colors.reset}`);
    console.log(`${colors.yellow}🔧 Verifique os logs acima para identificar problemas específicos.${colors.reset}`);
    console.log(`${colors.yellow}📋 Qualidade do código: NECESSITA ATENÇÃO${colors.reset}\n`);
  }
  
  // Próximos passos
  console.log(`${colors.cyan}📝 PRÓXIMOS PASSOS RECOMENDADOS:${colors.reset}`);
  if (successfulTests === totalTests) {
    console.log(`   ${colors.green}✅ Sistema aprovado para produção${colors.reset}`);
    console.log(`   ${colors.blue}🚀 Execute testes de interface web para validação visual${colors.reset}`);
    console.log(`   ${colors.blue}📱 Teste fluxos de usuário end-to-end${colors.reset}`);
  } else {
    console.log(`   ${colors.red}🔍 Analise os testes falharam em detalhes${colors.reset}`);
    console.log(`   ${colors.yellow}🛠️  Corrija problemas identificados${colors.reset}`);
    console.log(`   ${colors.blue}🔄 Execute novamente os testes após correções${colors.reset}`);
  }
  
  console.log(`\n${colors.magenta}${'='.repeat(80)}${colors.reset}`);
  console.log(`${colors.magenta}${colors.bright}🏁 SUITE DE TESTES CONCLUÍDA${colors.reset}\n`);
}

// Executar todos os testes
runAllTests().catch((error) => {
  console.error(`${colors.red}❌ Erro crítico na execução da suite: ${error.message}${colors.reset}`);
  process.exit(1);
});

