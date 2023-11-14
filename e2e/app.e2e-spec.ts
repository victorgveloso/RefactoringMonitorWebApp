import { RefactoringMinerWebAppPage } from './app.po';

describe('refactoring-miner-web-app App', function() {
  let page: RefactoringMinerWebAppPage;

  beforeEach(() => {
    page = new RefactoringMinerWebAppPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
