import { HomePage } from './home.po';

describe('Home | Page', () => {
  const page = new HomePage();

  page.navigateTo();

  it('should display banner heading', () => {
    expect(page.getBannerHeading()).toEqual('Register to Metis');
  });

  it('should display banner text', () => {
    expect(page.getBannerText()).toEqual('Ever wondered how to automagically digest huge amounts of data with the push of a button?');
  });

  it('should display banner link text', () => {
    expect(page.getBannerLinkText()).toEqual('REGISTER TO METIS HERE');
  });
});

