# blog-source

## Kurulum

### Windows için Kurulum Adımları:

1. Ruby Kurulumu:
   - [RubyInstaller](https://rubyinstaller.org/downloads/) sitesinden Ruby+Devkit sürümünü indirin
   - İndirdiğiniz kurulum dosyasını çalıştırın
   - Kurulum sırasında tüm seçenekleri işaretleyin
   - Kurulum bittiğinde "ridk install" seçeneğini işaretli bırakın
   - Açılan komut satırında 3 numaralı seçeneği (MSYS2 and MINGW development toolchain) seçin

2. Jekyll ve Bundler Kurulumu:
   ```bash
   gem install jekyll bundler
   ```

3. Proje bağımlılıklarını yükleyin:
   ```bash
   bundle install
   ```

## Çalıştırma

Projeyi lokalde çalıştırmak için:

```bash
bundle exec jekyll serve
```

Site http://localhost:4000 adresinde çalışacaktır.
